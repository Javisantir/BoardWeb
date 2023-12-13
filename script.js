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
const minimizeButton = document.getElementById('minimizeButton');
const toolPanel = document.getElementById('toolPanel');

let textSize = 16;
let selectedIcon = null;
let selectedText = null;
let currentImageSrc = '';
let painting = false;
let isErasing = false;
let iconSize = 50; 
let isDragging = false;
let dragStartX, dragStartY;

let isDrawingEnabled = true;


/*Minimize Button*/
minimizeButton.addEventListener('click', function() {
    toolPanel.classList.toggle('minimized');
});


/*Map*/
/*Select Category*/
document.getElementById('categorySelector').addEventListener('change', function() {
    const selectedCategory = this.value;
    const mapSelector = document.getElementById('MapSelector');
    mapSelector.style.display = "block";
    if(selectedCategory === 'none')
    {
        mapSelector.style.display = "none";
        return;
    }

    loadMaps(selectedCategory);
});

/*Load Maps*/
function loadMaps(category) {
    fetch('json/maps.json')
        .then(response => response.json())
        .then(data => {
            const fileSelector = document.getElementById('fileSelector');
            fileSelector.innerHTML = ''; 

            data.maps.filter(map => map.category === category).forEach(map => {
                const option = document.createElement('option');
                option.value = map.value;
                option.textContent = map.text;
                fileSelector.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
}

function adjustImageSize(imgWidth, imgHeight, maxWidth, maxHeight) {
    const minWidth = maxWidth / 2;
    const minHeight = maxHeight / 2;

    let newWidth = imgWidth;
    let newHeight = imgHeight;

    if (newWidth < minWidth) {
        newWidth = minWidth;
        newHeight = minWidth * (imgHeight / imgWidth);
    }
    if (newHeight < minHeight) {
        newHeight = minHeight;
        newWidth = minHeight * (imgWidth / imgHeight);
    }

    if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth * (imgHeight / imgWidth);
    }
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * (imgWidth / imgHeight);
    }

    imageCanvas.width = newWidth;
    imageCanvas.height = newHeight;
    drawingCanvas.width = newWidth;
    drawingCanvas.height = newHeight;
}

fileSelector.addEventListener('change', function() {
    document.getElementById('initialMessage').style.display = 'none';
    document.querySelector('.canvas-container').style.display = 'block';
    
    const selectedFile = fileSelector.value;
    currentImageSrc = 'media/maps/' + selectedFile;
    
    const img = new Image();
    img.onload = function() {
        adjustImageSize(img.width, img.height, window.innerWidth, window.innerHeight);
        imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
    };

    img.src = currentImageSrc;
});



/*Painter*/
function startPosition(e) {
    if (!isDrawingEnabled) return;
    painting = true;
    saveHistory();
    draw(e);
}

function finishedPosition() {
    painting = false;
    drawingCtx.beginPath();
    saveHistory();
}

colorPicker.addEventListener('click', function() {
    deactivateEraser();
    document.querySelectorAll('.icon.selected, .weapon.selected').forEach(selected => {
        selected.classList.remove('selected');
    });
    isDrawingEnabled = true;
    selectedIcon = null;
    selectedText = null;
});

function draw(e) {
    if (!painting) return;
    drawingCtx.lineCap = 'round';
    drawingCtx.lineWidth = brushSizeSlider.value;
    drawingCtx.strokeStyle = colorPicker.value;
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


/*Eraser*/
eraserBtn.addEventListener('click', function() {
    if (isErasing) {
        deactivateEraser();
    } else {
        document.querySelectorAll('.icon.selected, .weapon.selected').forEach(selected => {
            selected.classList.remove('selected');
        });
        isDrawingEnabled = true;
        selectedIcon = null;
        selectedText = null;
        activateEraser();
    }
});

function activateEraser() {
    isErasing = true;
    drawingCtx.globalCompositeOperation = 'destination-out';
    eraserBtn.classList.add('active');
    saveHistory();
}

function deactivateEraser() {
    isErasing = false;
    drawingCtx.globalCompositeOperation = 'source-over';
    eraserBtn.classList.remove('active');
    saveHistory();
}


/*Clear*/
clearBtn.addEventListener('click', function() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    saveHistory();
});

/*Bruhs Size*/
brushSizeSlider.addEventListener('input', function() {
    drawingCtx.lineWidth = brushSizeSlider.value;
});


/*Icons*/
document.addEventListener("DOMContentLoaded", function () {
    loadIcons('all');
});

document.getElementById('tierSelector').addEventListener('change', function() {
    loadIcons(this.value);
});

function loadIcons(selection) {
    let jsonFile = '';
    let containerId = 'icons'; // ID del contenedor donde se mostrarán los íconos

    switch (selection) {
        case 'weapons':
            jsonFile = 'json/weapons.json';
            break;
        case 'artillery':
            jsonFile = 'json/artillery.json';
            break;
        case 'customicons':
            jsonFile = 'json/customicons.json';
            break;
        default:
            jsonFile = 'json/icons.json';
    }

    fetch(jsonFile)
        .then((response) => response.json())
        .then((data) => {
            const container = document.getElementById(containerId);
            container.innerHTML = ''; // Limpiar íconos existentes

            let items = [];
            if (selection === 'weapons' || selection === 'artillery' || selection === 'customicons') {
                items = data[selection];
            } else {
                items = data.icons.filter(icon => selection === 'all' || icon.tier === selection);
            }

            items.forEach((item) => {
                const img = document.createElement("img");
                img.src = item.src;
                img.alt = item.name;
                img.className = 'icon';
                img.dataset.icon = item.src; 
                container.appendChild(img);
            });

            attachIconClickEvents();
        })
        .catch((error) => {
            console.error("Error al cargar el archivo JSON: ", error);
        });
}

function attachIconClickEvents() {
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', function() {
            deactivateEraser();
            selectIcon(this);
            document.querySelectorAll('.icon.selected').forEach(i => i.classList.remove('selected'));
            if (selectedIcon === this.getAttribute('data-icon')) {
                selectedIcon = null;
                isDrawingEnabled = true;
                this.classList.remove('selected');
            } else {
                selectedIcon = this.getAttribute('data-icon');
                isDrawingEnabled = false;
                this.classList.add('selected');
                icon.style.width = this.value + 'px';
                icon.style.height = this.value + 'px';
            }
        });
    });
}

/*Paint Icon on canvas*/
drawingCanvas.addEventListener('click', function(event) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (selectedIcon) {
        drawIconOnCanvas(x, y, selectedIcon);
    }
});

function drawIconOnCanvas(x, y, iconSrc) {
    const img = new Image();
    img.onload = function() {
        drawingCtx.drawImage(img, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        saveHistory();
    };
    img.src = iconSrc;
}


/*Icons size*/
iconSizeSlider.addEventListener('input', function() {
    iconSize = this.value;
});



/*Text*/
// Event Listener para los textos
submitTextBtn.addEventListener('click', function() {
    const words = textInput.value.split(' ');
    textIconsContainer.innerHTML = '';

    words.forEach(word => {
        if (word.trim() !== '') {
            const textIcon = document.createElement('div');
            textIcon.classList.add('text-icon');
            textIcon.textContent = word;
            textIcon.addEventListener('click', function() {
                // Deseleccionar si ya está seleccionado
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedText = null;
                    isDrawingEnabled = true;
                } else {
                    // Deseleccionar otros y seleccionar este
                    document.querySelectorAll('.icon.selected, .text-icon.selected').forEach(selected => {
                        selected.classList.remove('selected');
                    });
                    deactivateEraser();
                    this.classList.add('selected');
                    selectedIcon = null;
                    selectedText = word;
                    isDrawingEnabled = false;
                }
            });
            textIconsContainer.appendChild(textIcon);
        }
    });
});

function selectIcon(iconElement) {
    document.querySelectorAll('.icon.selected, .text-icon.selected').forEach(selected => {
        selected.classList.remove('selected');
    });
    iconElement.classList.add('selected');
    selectedText = null;
    isDrawingEnabled = false;
}

/*Text Size*/
textSizeSlider.addEventListener('input', function() {
    textSize = this.value;
});

/*Text on canvas*/
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

        drawingCtx.fillStyle = 'white';
        drawingCtx.fillRect(x - 5, y - parseInt(textSize, 10), textWidth + 10, textHeight);

        drawingCtx.fillStyle = 'black';
        drawingCtx.fillText(selectedText, x, y);
    }
});


/*CTR+Z*/
let history = [];
const maxHistorySize = 2000; // Límite de la cantidad de pasos que puedes deshacer

function saveHistory() {
    if (history.length >= maxHistorySize) {
        history.shift(); // Elimina el estado más antiguo si se alcanza el límite
    }
    history.push(drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height));
}

function undo() {
    if (history.length > 0) {
        const lastState = history.pop();
        drawingCtx.putImageData(lastState, 0, 0);
    }
}

// Añade un listener para los eventos de teclado
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        console.log('Undo');
        undo();
    }
});



/*Customs*/
document.getElementById('fileUploadBtn').addEventListener('click', function() {
    document.getElementById('mapUpload').click();
});

document.getElementById('IconUploadButton').addEventListener('click', function() {
    document.getElementById('iconUpload').click();
});