const drawingCanvas = document.getElementById('Board');
const imageCanvas = document.getElementById('imageCanvas');
const drawingCtx = drawingCanvas.getContext('2d');
const imageCtx = imageCanvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('EraserBtn');
const clearBtn = document.getElementById('clearBtn');
const brushSizeSlider = document.getElementById('brushSize');
const fileSelector = document.getElementById('fileSelector');
const iconSizeSlider = document.getElementById('iconSize'); // Nuevo control deslizante para el tamaño del icono

let selectedIcon = null;
let currentImageSrc = '';
let painting = false;
let isErasing = false;
let iconSize = 50; // Valor inicial para el tamaño del icono

// Evento para cambiar el tamaño del icono
iconSizeSlider.addEventListener('input', function() {
    iconSize = this.value;
});

// Selección de iconos
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', function() {
        if (this.classList.contains('selected')) {
            this.classList.remove('selected');
            selectedIcon = null;
        } else {
            document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
            let aux = this.getAttribute('data-icon');
            selectedIcon = aux.toString().replace("/media/icons/", "media/icons/");
            this.classList.add('selected');
        }
    });
});

// Dibujar icono en el lienzo
drawingCanvas.addEventListener('click', function(event) {
    if (selectedIcon) {
        const rect = drawingCanvas.getBoundingClientRect();
        const scaleX = drawingCanvas.width / rect.width;
        const scaleY = drawingCanvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const img = new Image();
        img.onload = function() {
            drawingCtx.drawImage(img, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        };
        img.src = selectedIcon;
    }
});

// Cargar imagen de fondo
fileSelector.addEventListener('change', function() {
    const selectedFile = fileSelector.value;
    currentImageSrc = 'media/maps/' + selectedFile;
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

// Funcionalidad del borrador
eraserBtn.addEventListener('click', function() {
    isErasing = !isErasing;
    drawingCtx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    eraserBtn.classList.toggle('active', isErasing);
});

// Ajustar tamaño del pincel/borrador
brushSizeSlider.addEventListener('input', function() {
    drawingCtx.lineWidth = brushSizeSlider.value;
});

// Limpiar el lienzo
clearBtn.addEventListener('click', function() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

// Funciones para el dibujo
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
    drawingCtx.lineWidth = brushSizeSlider.value;
    drawingCtx.strokeStyle = isErasing ? 'rgba(0,0,0,0)' : colorPicker.value;
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

// Ajustar tamaño de la imagen de fondo
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
