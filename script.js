const drawingCanvas = document.getElementById('Board');
const imageCanvas = document.getElementById('imageCanvas');
const drawingCtx = drawingCanvas.getContext('2d');
const imageCtx = imageCanvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('EraserBtn');
const clearBtn = document.getElementById('clearBtn');
const brushSizeSlider = document.getElementById('brushSize');
const fileSelector = document.getElementById('fileSelector');
const iconSizeSlider = document.getElementById('iconSize');
const textInput = document.getElementById('textInput');
const submitTextBtn = document.getElementById('submitText');
const textIconsContainer = document.getElementById('text-icons-container');
const textSizeSlider = document.getElementById('textSizeSlider');

let textSize = 16; // Valor inicial del tamaño del texto
let selectedIcon = null;
let selectedText = null;
let currentImageSrc = '';
let painting = false;
let isErasing = false;
let iconSize = 50; // Valor inicial para el tamaño del icono

iconSizeSlider.addEventListener('input', function() {
    iconSize = this.value;
});

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

submitTextBtn.addEventListener('click', function() {
    const words = textInput.value.split(' ');
    textIconsContainer.innerHTML = '';

    words.forEach(word => {
        if (word.trim() !== '') {
            const textIcon = document.createElement('div');
            textIcon.classList.add('text-icon');
            textIcon.textContent = word;
            textIcon.addEventListener('click', function() {
                document.querySelectorAll('.icon, .text-icon').forEach(icon => icon.classList.remove('selected'));
                selectedIcon = null;

                this.classList.add('selected');
                selectedText = word;
            });
            textIconsContainer.appendChild(textIcon);
        }
    });
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

// Funcionalidad para cargar imágenes de fondo
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

// Funcionalidades de borrador y limpieza
eraserBtn.addEventListener('click', function() {
    isErasing = !isErasing;
    if (isErasing) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        eraserBtn.classList.add('active');
        colorPicker.classList.add('inactive'); // Añadir clase al input de color
    } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        eraserBtn.classList.remove('active');
        colorPicker.classList.remove('inactive'); // Quitar clase del input de color
    }
});

function draw(e) {
    if (!painting) return;
    drawingCtx.lineCap = 'round';
    drawingCtx.lineWidth = brushSizeSlider.value;

    // La siguiente línea podría no ser necesaria si estás utilizando 'globalCompositeOperation'
    // drawingCtx.strokeStyle = isErasing ? 'rgba(0,0,0,0)' : colorPicker.value;

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

brushSizeSlider.addEventListener('input', function() {
    drawingCtx.lineWidth = brushSizeSlider.value;
});

clearBtn.addEventListener('click', function() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

// Función para ajustar el tamaño de la imagen
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

textSizeSlider.addEventListener('input', function() {
    textSize = this.value;
});

textSizeSlider.addEventListener('input', function() {
    textSize = this.value;
});

// Funcionalidad para dibujar texto e iconos en el lienzo
drawingCanvas.addEventListener('click', function(event) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (selectedIcon) {
        const img = new Image();
        img.onload = function() {
            drawingCtx.drawImage(img, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        };
        img.src = selectedIcon;
    } else if (selectedText) {
        drawingCtx.font = textSize + "px Arial";
        const textWidth = drawingCtx.measureText(selectedText).width;
        const textHeight = parseInt(textSize, 10) * 1.2;

        // Dibujar un rectángulo blanco detrás del texto
        drawingCtx.fillStyle = 'white';
        drawingCtx.fillRect(x - 5, y - parseInt(textSize, 10), textWidth + 10, textHeight);

        // Dibujar el texto
        drawingCtx.fillStyle = 'black';
        drawingCtx.fillText(selectedText, x, y);
    }
});
