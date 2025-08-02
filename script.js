document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const fileNameDisplay = document.getElementById('fileName');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatioCheck = document.getElementById('aspectRatioCheck');
    const resizeButton = document.getElementById('resizeButton');
    const resizedImage = document.getElementById('resizedImage');
    const downloadLink = document.getElementById('downloadLink');
    const outputContainer = document.querySelector('.output-container');

    let originalImage = null;
    let originalAspectRatio = 0;

    // High-quality image resizing function using step-down resampling
    function highQualityResize(img, newWidth, newHeight) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let currentWidth = img.width;
        let currentHeight = img.height;

        tempCanvas.width = currentWidth;
        tempCanvas.height = currentHeight;
        tempCtx.drawImage(img, 0, 0, currentWidth, currentHeight);

        // Resample in steps for better quality
        while (currentWidth * 0.5 > newWidth) {
            const halfWidth = Math.floor(currentWidth * 0.5);
            const halfHeight = Math.floor(currentHeight * 0.5);
            
            tempCtx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight, 0, 0, halfWidth, halfHeight);
            
            currentWidth = halfWidth;
            currentHeight = halfHeight;
        }

        // Final resize to the target dimensions
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = newWidth;
        finalCanvas.height = newHeight;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight, 0, 0, newWidth, newHeight);
        
        return finalCanvas;
    }

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    widthInput.value = originalImage.width;
                    heightInput.value = originalImage.height;
                    originalAspectRatio = originalImage.width / originalImage.height;
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    widthInput.addEventListener('input', () => {
        if (aspectRatioCheck.checked && originalAspectRatio > 0) {
            const newWidth = parseInt(widthInput.value);
            if (!isNaN(newWidth)) {
                heightInput.value = Math.round(newWidth / originalAspectRatio);
            }
        }
    });

    heightInput.addEventListener('input', () => {
        if (aspectRatioCheck.checked && originalAspectRatio > 0) {
            const newHeight = parseInt(heightInput.value);
            if (!isNaN(newHeight)) {
                widthInput.value = Math.round(newHeight * originalAspectRatio);
            }
        }
    });

    resizeButton.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please choose an image first.');
            return;
        }

        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
            alert('Please enter valid positive dimensions.');
            return;
        }

        // Disable button to prevent multiple clicks
        resizeButton.disabled = true;
        resizeButton.textContent = 'Resizing...';

        // Use setTimeout to allow UI to update before heavy processing
        setTimeout(() => {
            try {
                // Use the high-quality resize function
                const resizedCanvas = highQualityResize(originalImage, newWidth, newHeight);
                const resizedImageDataURL = resizedCanvas.toDataURL('image/png', 1.0); // PNG format for max quality

                resizedImage.src = resizedImageDataURL;
                downloadLink.href = resizedImageDataURL;
                outputContainer.style.display = 'block';
                downloadLink.style.display = 'inline-block';
            } catch (error) {
                console.error("An error occurred during resize:", error);
                alert("Sorry, an error occurred while resizing the image.");
            } finally {
                // Re-enable the button
                resizeButton.disabled = false;
                resizeButton.textContent = 'Resize Image';
            }
        }, 50); // A small delay
    });
});
