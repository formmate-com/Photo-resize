const imageInput = document.getElementById('imageInput');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const resizeButton = document.getElementById('resizeButton');
const resizedImage = document.getElementById('resizedImage');
const downloadLink = document.getElementById('downloadLink');
const outputContainer = document.querySelector('.output-container');

let originalImage = null;
let originalWidth = 0;
let originalHeight = 0;
let maintainAspectRatio = true; // Aspect ratio lock enabled by default

// Function to perform high-quality resize using step-down resampling
function highQualityResize(sourceImage, newWidth, newHeight) {
    const srcWidth = sourceImage.width;
    const srcHeight = sourceImage.height;

    // If the size is the same or larger, no need for complex resampling
    if (newWidth >= srcWidth && newHeight >= srcHeight) {
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImage, 0, 0, newWidth, newHeight);
        return canvas;
    }

    // Create a temporary canvas for resampling
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    let currentWidth = srcWidth;
    let currentHeight = srcHeight;
    tempCanvas.width = currentWidth;
    tempCanvas.height = currentHeight;
    tempCtx.drawImage(sourceImage, 0, 0, currentWidth, currentHeight);

    // Step-down resizing for better quality
    while (currentWidth * 0.5 > newWidth && currentHeight * 0.5 > newHeight) {
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
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.onload = () => {
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
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
        alert('Please enter valid dimensions.');
        return;
    }

    // Use the high-quality resize function
    const resizedCanvas = highQualityResize(originalImage, newWidth, newHeight);

    const resizedImageDataURL = resizedCanvas.toDataURL('image/png'); // Using PNG for lossless quality after resize
    resizedImage.src = resizedImageDataURL;
    downloadLink.href = resizedImageDataURL;
    outputContainer.style.display = 'block';
    downloadLink.style.display = 'inline-block';
});
