document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const unitSelect = document.getElementById('unit');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const sizeInput = document.getElementById('size');
    const resizeButton = document.getElementById('resizeButton');
    const downloadLink = document.getElementById('downloadLink');

    let originalImage = null;

    // Display selected image preview
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                originalImage = new Image();
                originalImage.src = event.target.result;
                originalImage.onload = () => {
                    widthInput.value = originalImage.width;
                    heightInput.value = originalImage.height;
                    unitSelect.value = 'px';
                };
            };
            reader.readAsDataURL(file);
            downloadLink.classList.add('hidden');
        }
    });

    // Update quality slider value
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value;
    });

    // Resize button functionality
    resizeButton.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please select an image first.');
            return;
        }

        const dpi = 96; // Standard screen DPI
        let targetWidth = parseFloat(widthInput.value);
        let targetHeight = parseFloat(heightInput.value);
        const unit = unitSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const targetSizeKB = parseFloat(sizeInput.value);

        if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
            alert('Please enter valid width and height.');
            return;
        }

        // Convert units to pixels
        if (unit === 'cm') {
            targetWidth = (targetWidth / 2.54) * dpi;
            targetHeight = (targetHeight / 2.54) * dpi;
        } else if (unit === 'in') {
            targetWidth = targetWidth * dpi;
            targetHeight = targetHeight * dpi;
        } else if (unit === 'mm') {
            targetWidth = (targetWidth / 25.4) * dpi;
            targetHeight = (targetHeight / 25.4) * dpi;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        // Adjust quality to meet target file size
        let currentQuality = quality;
        let resizedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

        if (!isNaN(targetSizeKB) && targetSizeKB > 0) {
            let attempt = 0;
            const maxAttempts = 10;
            while (getBlobSize(resizedDataUrl) > targetSizeKB * 1024 && attempt < maxAttempts) {
                currentQuality -= 0.1;
                if (currentQuality < 0) {
                    currentQuality = 0;
                    break;
                }
                resizedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                attempt++;
            }
        }
        
        downloadLink.href = resizedDataUrl;
        downloadLink.download = 'resized-image.jpg';
        downloadLink.classList.remove('hidden');
        alert(`Image resized! New quality is approximately ${(currentQuality * 100).toFixed(0)}.`);

    });
    
    // Helper function to get blob size from data URL
    function getBlobSize(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        if (!base64) return 0;
        const binary = atob(base64);
        return binary.length;
    }
});
