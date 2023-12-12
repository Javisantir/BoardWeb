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

let textSize = 16;
let selectedIcon = null;
let selectedText = null;
let currentImageSrc = '';
let painting = false;
let isErasing = false;
let iconSize = 50; 

const toolPanel = document.getElementById('toolPanel');
let isDragging = false;
let dragStartX, dragStartY;

const minimizeButton = document.getElementById('minimizeButton');

document.getElementById('iconUpload').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files) {
        const uploadedIconContainer = document.getElementById('uploadedIcons');

        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "uploaded-icon";
                uploadedIconContainer.appendChild(img);

                img.addEventListener('click', function() {
                    selectedIcon = e.target.result;
                });
            };

            reader.readAsDataURL(file);
        });
    }
});


function drawIconOnCanvas(x, y, iconSrc) {
    const img = new Image();
    img.onload = function() {
        drawingCtx.drawImage(img, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
    };
    img.src = iconSrc;
}

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
            document.querySelectorAll('.icon.selected').forEach(i => i.classList.remove('selected'));
            if (selectedIcon === this.getAttribute('data-icon')) {
                selectedIcon = null;
                this.classList.remove('selected');
            } else {
                selectedIcon = this.getAttribute('data-icon');
                console.log(selectedIcon);
                this.classList.add('selected');
                icon.style.width = this.value + 'px';
                icon.style.height = this.value + 'px';
            }
        });
    });
}

// Event listener para el selector de categorías
document.getElementById('tierSelector').addEventListener('change', function() {
    loadIcons(this.value);
});


document.addEventListener("DOMContentLoaded", function () {
    loadIcons('all');
});

colorPicker.addEventListener('click', function() {
    document.querySelectorAll('.icon.selected, .weapon.selected').forEach(selected => {
        selected.classList.remove('selected');
    });

    selectedIcon = null;
    selectedText = null;
});

minimizeButton.addEventListener('click', function() {
    toolPanel.classList.toggle('minimized');
});

iconSizeSlider.addEventListener('input', function() {
    iconSize = this.value;
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

eraserBtn.addEventListener('click', function() {
    isErasing = !isErasing;
    if (isErasing) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        eraserBtn.classList.add('active');
        colorPicker.classList.add('inactive'); // Añadir clase al input de color
    } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = colorPicker.value;
        eraserBtn.classList.remove('active');
        colorPicker.classList.remove('inactive'); // Quitar clase del input de color
    }
});

document.getElementById('mapUpload').addEventListener('change', function(event) {
    document.getElementById('initialMessage').style.display = 'none';
    document.querySelector('.canvas-container').style.display = 'block';
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                adjustImageSize(img.width, img.height, window.innerWidth, window.innerHeight);
                imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height); // Limpiar el canvas antes de dibujar
                imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(event.target.files[0]);
    }
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

brushSizeSlider.addEventListener('input', function() {
    drawingCtx.lineWidth = brushSizeSlider.value;
});

clearBtn.addEventListener('click', function() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

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


textSizeSlider.addEventListener('input', function() {
    textSize = this.value;
});

textSizeSlider.addEventListener('input', function() {
    textSize = this.value;
});

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




document.getElementById('fileUploadBtn').addEventListener('click', function() {
    document.getElementById('mapUpload').click();
});

document.getElementById('IconUploadButton').addEventListener('click', function() {
    document.getElementById('iconUpload').click();
});