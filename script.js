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

const toolPanel = document.getElementById('toolPanel');
let isDragging = false;
let dragStartX, dragStartY;

const minimizeButton = document.getElementById('minimizeButton');

document.addEventListener("DOMContentLoaded", function () {
    fetch("json/icons.json")
        .then((response) => response.json())
        .then((data) => {
            const iconsContainer = document.getElementById("icons");

            data.icons.forEach((icon) => {
                const img = document.createElement("img");
                img.src = icon.src;
                img.alt = icon.name;
                img.className = "icon";
                img.dataset.icon = icon.src; 
                iconsContainer.appendChild(img);
            });

            attachIconClickEvents();
        })
        .catch((error) => {
            console.error("Error al cargar el archivo JSON: ", error);
        });
});

colorPicker.addEventListener('click', function() {
    document.querySelectorAll('.icon.selected, .weapon.selected').forEach(selected => {
        selected.classList.remove('selected');
    });

    selectedIcon = null;
    selectedText = null;
});

document.addEventListener("DOMContentLoaded", function () {
    fetch('json/maps.json')
        .then(response => response.json())
        .then(data => {
            const fileSelector = document.getElementById('fileSelector');

            data.maps.forEach(map => {
                const option = document.createElement('option');
                option.value = map.value;
                option.textContent = map.text;
                fileSelector.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
});


document.addEventListener("DOMContentLoaded", function () {
    fetch("json/weapons.json")
        .then((response) => response.json())
        .then((data) => {
            const weaponsContainer = document.getElementById("weapons");

            data.weapons.forEach((weapon) => {
                const img = document.createElement("img");
                img.src = weapon.src;
                img.alt = weapon.name;
                img.className = "weapon";
                img.dataset.icon = weapon.src; 
                weaponsContainer.appendChild(img);
            });

            attachWeaponsClickEvents();
        })
        .catch((error) => {
            console.error("Error al cargar el archivo JSON: ", error);
        });
});


minimizeButton.addEventListener('click', function() {
    toolPanel.classList.toggle('minimized');
});

iconSizeSlider.addEventListener('input', function() {
    iconSize = this.value;
});

function attachIconClickEvents() {
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedIcon = null;
            } else {
                document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
                let aux = this.getAttribute('data-icon');
                selectedIcon = aux.toString().replace("/media/icons/", "media/icons/");
                console.log(selectedIcon);
                this.classList.add('selected');
            }
        });
    });
}

function attachWeaponsClickEvents() {
    document.querySelectorAll('.weapon').forEach(weapon => {
        weapon.addEventListener('click', function() {
            // Deseleccionar cualquier arma o icono seleccionado previamente
            document.querySelectorAll('.icon.selected, .weapon.selected').forEach(selected => {
                selected.classList.remove('selected');
            });

            // Si el arma ya estaba seleccionada, la deselecciona
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedIcon = null;
            } else {
                // Seleccionar la nueva arma y actualizar el icono seleccionado
                this.classList.add('selected');
                let aux = this.getAttribute('data-icon');
                selectedIcon = aux.toString().replace("/media/icons/", "media/icons/");

                // Restablecer el estado de borrador si está activo
                if (isErasing) {
                    isErasing = false;
                    drawingCtx.globalCompositeOperation = 'source-over';
                    drawingCtx.strokeStyle = colorPicker.value;
                    eraserBtn.classList.remove('active');
                    colorPicker.classList.remove('inactive');
                }
            }

            console.log(selectedIcon);
        });
    });
}


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


// Funcionalidades de borrador y limpieza
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
    // Establecer el tamaño mínimo como la mitad de la ventana
    const minWidth = maxWidth / 2;
    const minHeight = maxHeight / 2;

    let newWidth = imgWidth;
    let newHeight = imgHeight;

    // Ajustar el tamaño de la imagen para que sea al menos la mitad de la ventana
    if (newWidth < minWidth) {
        newWidth = minWidth;
        newHeight = minWidth * (imgHeight / imgWidth);
    }
    if (newHeight < minHeight) {
        newHeight = minHeight;
        newWidth = minHeight * (imgWidth / imgHeight);
    }

    // Ajustar el tamaño de la imagen para que no sea mayor que la ventana
    if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth * (imgHeight / imgWidth);
    }
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * (imgWidth / imgHeight);
    }

    // Ajustar el tamaño del canvas
    imageCanvas.width = newWidth;
    imageCanvas.height = newHeight;
    drawingCanvas.width = newWidth;
    drawingCanvas.height = newHeight;
}

// Evento de cambio para el selector de archivos
fileSelector.addEventListener('change', function() {
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
