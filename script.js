const drawingCanvas = document.getElementById('Board');
const imageCanvas = document.getElementById('imageCanvas');
const drawingCtx = drawingCanvas.getContext('2d');
const imageCtx = imageCanvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('EraserBtn');
const clearBtn = document.getElementById('clearBtn');
const brushSizeSlider = document.getElementById('brushSize');

let painting = false;
let isErasing = false;

function resizeCanvas() {
    drawingCanvas.width = imageCanvas.offsetWidth;
    drawingCanvas.height = imageCanvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

eraserBtn.addEventListener('click', function() {
    isErasing = !isErasing;

    if (isErasing) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        eraserBtn.classList.add('active'); // Añadir una clase cuando el borrador está activo
    } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = colorPicker.value;
        eraserBtn.classList.remove('active'); // Remover la clase cuando el borrador no está activo
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

fileInput.addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const maxSize = { width: window.innerWidth, height: window.innerHeight };
                const newSize = adjustImageSize(img.width, img.height, maxSize.width, maxSize.height);
                
                imageCanvas.width = newSize.width;
                imageCanvas.height = newSize.height;
                drawingCanvas.width = newSize.width;
                drawingCanvas.height = newSize.height;

                imageCtx.drawImage(img, 0, 0, newSize.width, newSize.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});
