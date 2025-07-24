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

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

    const resizedImageDataURL = canvas.toDataURL('image/png');
    resizedImage.src = resizedImageDataURL;
    downloadLink.href = resizedImageDataURL;
    outputContainer.style.display = 'block';
    downloadLink.style.display = 'inline-block';
});