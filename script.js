const drawingCanvas = document.getElementById('Board');
const imageCanvas = document.getElementById('imageCanvas');
const drawingCtx = drawingCanvas.getContext('2d');
const imageCtx = imageCanvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('EraserBtn');
const clearBtn = document.getElementById('clearBtn');
const brushSizeSlider = document.getElementById('brushSize');
const fileSelector = document.getElementById('fileSelector');
const icons = document.querySelectorAll('.icon');
let selectedIcon = null;
let currentImageSrc = '';
let painting = false;
let isErasing = false;

document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', function() {
        selectedIcon = this.getAttribute('data-icon');
        if (this.classList.contains('selected')) {
            this.classList.remove('selected');
            selectedIcon = null; // Elimina la selección si se hace clic nuevamente en el mismo icono
        } else {
            icons.forEach(icon => {
                icon.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedIcon = this.getAttribute('data-icon');
        }
    });
});

// Agrega el código JavaScript anterior aquí


drawingCanvas.addEventListener('click', function(event) {
    if (selectedIcon) {
        const rect = drawingCanvas.getBoundingClientRect();
        const scaleX = drawingCanvas.width / rect.width;
        const scaleY = drawingCanvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const img = new Image();
        img.onload = function() {
            // Ajustar las coordenadas x, y para que el icono se coloque en el lugar correcto
            drawingCtx.drawImage(img, x - img.width / 2, y - img.height / 2, 50, 50);
        };
        img.src = selectedIcon;
    }
});


fileSelector.addEventListener('change', function() {
    const selectedFile = fileSelector.value;
    currentImageSrc = '/media/maps/' + selectedFile;
    const img = new Image();
    img.onload = function() {
        const newSize = adjustImageSize(img.width, img.height, window.innerWidth, window.innerHeight);
        imageCanvas.width = newSize.width;
        imageCanvas.height = newSize.height;
        drawingCanvas.width = newSize.width;
        drawingCanvas.height = newSize.height;
        imageCtx.drawImage(img, 0, 0, newSize.width, newSize.height);
    };
    img.src = currentImageSrc;
});

eraserBtn.addEventListener('click', function() {
    isErasing = !isErasing;
    if (isErasing) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        eraserBtn.classList.add('active');
    } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = colorPicker.value;
        eraserBtn.classList.remove('active');
    }
});

brushSizeSlider.addEventListener('input', function() {
    drawingCtx.lineWidth = brushSizeSlider.value;
});

clearBtn.addEventListener('click', function() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    drawingCtx.beginPath();
}

function draw(e) {
    if (!painting) return;
    drawingCtx.lineCap = 'round';
    drawingCtx.lineWidth = isErasing ? brushSizeSlider.value : brushSizeSlider.value;
    if (!isErasing) {
        drawingCtx.strokeStyle = colorPicker.value;
    }
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
}

drawingCanvas.addEventListener('mousedown', startPosition);
drawingCanvas.addEventListener('mouseup', finishedPosition);
drawingCanvas.addEventListener('mousemove', draw);

function adjustImageSize(imgWidth, imgHeight, maxWidth, maxHeight) {
    let newWidth = imgWidth;
    let newHeight = imgHeight;
    if (imgWidth > maxWidth || imgHeight > maxHeight) {
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        newWidth = imgWidth * ratio;
        newHeight = imgHeight * ratio;
    }
    return { width: newWidth, height: newHeight };
}
