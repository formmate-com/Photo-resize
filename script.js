document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const fileNameDisplay = document.getElementById('fileName');
    const unitSelect = document.getElementById('unitSelect');
    const dpiInput = document.getElementById('dpiInput');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatioCheck = document.getElementById('aspectRatioCheck');
    const resizeButton = document.getElementById('resizeButton');
    const outputContainer = document.getElementById('outputContainer');
    const resizedImage = document.getElementById('resizedImage');
    const downloadLink = document.getElementById('downloadLink');

    // State
    let originalImage = null;
    let originalWidthInPx = 0;
    let originalHeightInPx = 0;
    let originalAspectRatio = 0;

    // --- Conversion Functions ---
    const convertToPx = (value, unit, dpi) => {
        if (unit === 'in') return value * dpi;
        if (unit === 'cm') return (value / 2.54) * dpi;
        if (unit === 'mm') return (value / 25.4) * dpi;
        return value; // Default is px
    };

    const convertFromPx = (pixels, unit, dpi) => {
        if (unit === 'in') return pixels / dpi;
        if (unit === 'cm') return (pixels / dpi) * 2.54;
        if (unit === 'mm') return (pixels / dpi) * 25.4;
        return pixels; // Default is px
    };
    
    // High-quality step-down resampling function
    function highQualityResize(img, newWidth, newHeight) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        let currentWidth = img.width;
        let currentHeight = img.height;

        while (currentWidth * 0.5 > newWidth) {
            const halfWidth = Math.floor(currentWidth * 0.5);
            const halfHeight = Math.floor(currentHeight * 0.5);
            tempCtx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight, 0, 0, halfWidth, halfHeight);
            currentWidth = halfWidth;
            currentHeight = halfHeight;
        }

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = newWidth;
        finalCanvas.height = newHeight;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight, 0, 0, newWidth, newHeight);
        return finalCanvas;
    }

    const updateDimensionInputs = () => {
        if (!originalImage) return;
        const unit = unitSelect.value;
        const dpi = parseFloat(dpiInput.value) || 300;
        
        widthInput.value = parseFloat(convertFromPx(originalWidthInPx, unit, dpi).toFixed(2));
        heightInput.value = parseFloat(convertFromPx(originalHeightInPx, unit, dpi).toFixed(2));
    };

    // --- Event Listeners ---
    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            fileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    originalWidthInPx = originalImage.width;
                    originalHeightInPx = originalImage.height;
                    originalAspectRatio = originalWidthInPx / originalHeightInPx;
                    updateDimensionInputs();
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a valid image file.");
        }
    };
    
    // This single listener on the input is enough now.
    imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    
    // Drag and Drop Listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
    });
    uploadArea.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]), false);
    
    // Listen for changes in units or DPI
    unitSelect.addEventListener('change', updateDimensionInputs);
    dpiInput.addEventListener('input', updateDimensionInputs);

    // Aspect ratio logic
    widthInput.addEventListener('input', () => {
        if (aspectRatioCheck.checked && originalAspectRatio > 0) {
            const newWidth = parseFloat(widthInput.value);
            if (!isNaN(newWidth)) {
                heightInput.value = parseFloat((newWidth / originalAspectRatio).toFixed(2));
            }
        }
    });

    heightInput.addEventListener('input', () => {
        if (aspectRatioCheck.checked && originalAspectRatio > 0) {
            const newHeight = parseFloat(heightInput.value);
            if (!isNaN(newHeight)) {
                widthInput.value = parseFloat((newHeight * originalAspectRatio).toFixed(2));
            }
        }
    });
    
    // Resize Button Click
    resizeButton.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please choose an image first.');
            return;
        }

        const unit = unitSelect.value;
        const dpi = parseFloat(dpiInput.value) || 300;
        const newWidth = parseFloat(widthInput.value);
        const newHeight = parseFloat(heightInput.value);

        if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
            alert('Please enter valid positive dimensions.');
            return;
        }

        const newWidthInPx = Math.round(convertToPx(newWidth, unit, dpi));
        const newHeightInPx = Math.round(convertToPx(newHeight, unit, dpi));
        
        resizeButton.disabled = true;
        resizeButton.textContent = 'Resizing...';

        setTimeout(() => {
            try {
                const resizedCanvas = highQualityResize(originalImage, newWidthInPx, newHeightInPx);
                const resizedImageDataURL = resizedCanvas.toDataURL('image/png', 1.0);

                resizedImage.src = resizedImageDataURL;
                downloadLink.href = resizedImageDataURL;
                outputContainer.style.display = 'block';
                downloadLink.style.display = 'inline-block';
            } catch (error) {
                console.error("Resize error:", error);
                alert("An error occurred. The image might be too large.");
            } finally {
                resizeButton.disabled = false;
                resizeButton.textContent = 'Resize Image';
            }
        }, 50);
    });
});
