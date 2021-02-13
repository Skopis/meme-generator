'use strict';

var gElCanvas = document.getElementById('my-canvas');
var gCtx;
var gImgs = [];
var gMeme =
{
    selectedImgId: 0,
    selectedLineIdx: 0,
    lines: [
        {
            txt: '',
            pos: { x: (gElCanvas.width / 2), y: 40 },
            isDragging: false,
            size: 40,
            texclr: '#000000',
            fillclr: '#FFFFFF',
            fontfam: 'impact',
            txtAlign: 'center'
        }
    ]
}
var gWasDownFirst = false;


var gStartPos;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
var gCurrImage;

_makegImgs();


function init() {
    renderGallery();
    document.querySelector('.meme-editor-section').style.display = 'none';
}

function renderGallery() {
    var srtHTML = '';
    for (let i = 0; i < gImgs.length; i++) {
        var currImg = gImgs[i];
        srtHTML +=
            `<figure class="gallery-item gallery-item-${i + 1}">
        <img src="${currImg.url}" class="gallery-img" alt="Image${i + 1}" onclick="initCanvas(${currImg.id})">
        </figure>`
    };
    document.querySelector('.gallery').innerHTML = srtHTML;
}

function addListeners() {
    addMouseListeners();
    addTouchListeners();
}
function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove);
    gElCanvas.addEventListener('mousedown', onDown);
    gElCanvas.addEventListener('mouseup', onUp);
}
function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove);
    gElCanvas.addEventListener('touchstart', onDown);
    gElCanvas.addEventListener('touchend', onUp);
}

function insertTextLine() {
    var text;
    text = document.getElementById('text-line').value;
    drawText(text, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
    gMeme.lines[gMeme.selectedLineIdx].txt = text;
    renderCanvas();
    drawBorder();
}

function onDown(ev) {
    const pos = getEvPos(ev);
    if (!isTextClicked(pos)) return;
    document.getElementById('text-line').value = gMeme.lines[gMeme.selectedLineIdx].txt;
    gMeme.lines[gMeme.selectedLineIdx].isDragging = true;
    gStartPos = pos;

    gMeme.lines[gMeme.selectedLineIdx].pos.x = pos.x;
    gMeme.lines[gMeme.selectedLineIdx].pos.y = pos.y;

    renderCanvas();
}

function isTextClicked(clickedPos) {
    for (let i = 0; i < gMeme.lines.length; i++) {
        let currLine = gMeme.lines[i];
        let textWidth = gCtx.measureText(currLine.txt).width;
        if (clickedPos.x >= currLine.pos.x - textWidth / 4 &&
            clickedPos.x <= currLine.pos.x - textWidth / 4 + textWidth * 1.5 &&
            clickedPos.y >= currLine.pos.y - currLine.size &&
            clickedPos.y <= currLine.pos.y - currLine.size + currLine.size * 1.5) {
            gMeme.selectedLineIdx = i;
            return true;
        }
    }
    return false;
}

function drawBorder() {
    var currLine = gMeme.lines[gMeme.selectedLineIdx];
    if (!currLine.txt) return;
    gCtx.font = `${currLine.size}px ${currLine.fontfam}`;
    var textWidth = gCtx.measureText(currLine.txt).width;
    gCtx.strokeStyle = 'black';
    gCtx.strokeRect(currLine.pos.x - textWidth / 4, currLine.pos.y - currLine.size, textWidth * 1.5, currLine.size * 1.5);
}

function onMove(ev) {
    if (gMeme.lines[gMeme.selectedLineIdx].isDragging) {
        const pos = getEvPos(ev);
        const dx = pos.x - gStartPos.x;
        const dy = pos.y - gStartPos.y;

        gMeme.lines[gMeme.selectedLineIdx].pos.x += dx;
        gMeme.lines[gMeme.selectedLineIdx].pos.y += dy;

        gStartPos = pos;
        renderCanvas();
    }
}

function onUp() {
    gMeme.lines[gMeme.selectedLineIdx].isDragging = false;
    document.body.style.cursor = 'default';
    renderCanvas();
    drawBorder();
}

function getEvPos(ev) {
    var pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (gTouchEvs.includes(ev.type)) {
        ev.preventDefault();
        ev = ev.changedTouches[0];
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        };
    }
    return pos;
}

function renderCanvas() {
    clearCanvas();
    gCtx.fillRect(0, 0, gElCanvas.width, gElCanvas.height);
    drawImg();
    for (var i = 0; i < gMeme.lines.length; i++) {
        drawText(gMeme.lines[i].txt, gMeme.lines[i].pos.x, gMeme.lines[i].pos.y, i);
    }
}

function initCanvas(imgId) {
    gCtx = gElCanvas.getContext('2d');

    addListeners();

    document.querySelector('.gallery-section').style.display = 'none';
    document.querySelector('.meme-editor-section').style.display = 'flex';
    resizeCanvas();

    if (imgId) {
        gMeme.selectedImgId = imgId;

        gCurrImage = gImgs.find(image => image.id === imgId);

        const img = new Image()
        img.src = gCurrImage.url;
        img.onload = () => {
            gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        }

        document.getElementById('text-line').value = '';
        gMeme.lines.forEach((line) => {
            line.txt = '';
        });
    }
}

function goToGallery() {
    document.querySelector('.gallery-section').style.display = 'block';
    document.querySelector('.meme-editor-section').style.display = 'none';
}

function clearCanvas() {
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
}

function drawImg() {
    const img = new Image()
    img.src = gCurrImage.url;
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}

function deleteLine() {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    document.getElementById('text-line').value = '';
    if (gMeme.selectedLineIdx === 0) {
        gMeme.lines.splice(0, 1, {
            txt: '',
            pos: { x: (gElCanvas.width / 2), y: 40 },
            isDragging: false,
            size: 40,
            texclr: '#000000',
            fillclr: '#FFFFFF',
            fontfam: 'impact',
            txtAlign: 'center'
        });
    }
    else {
        gMeme.lines.splice(gMeme.selectedLineIdx, 1);
    }
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
    renderCanvas();
}

function addNewLine() {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;
    gMeme.selectedLineIdx = gMeme.lines.length;

    document.getElementById('text-line').value = '';
    if (gMeme.selectedLineIdx >= 1) {//if it's the second line that is added
        gMeme.lines.push({
            txt: '',
            pos: { x: (gElCanvas.width / 2), y: (gElCanvas.height - 40) },
            isDragging: false,
            size: 40,
            texclr: '#000000',
            fillclr: '#FFFFFF',
            fontfam: 'impact',
            txtAlign: 'center'
        });
        if (gMeme.selectedLineIdx >= 2) {//if it's the third line and above that's added
            gMeme.lines[gMeme.selectedLineIdx].pos = { x: (gElCanvas.width / 2), y: gElCanvas.height / 2 };
        }
    }
}

function downloadCanvas(elLink) {
    renderCanvas();

    const data = gElCanvas.toDataURL();
    elLink.href = data;
    elLink.download = 'myCanvas';
}

function changeFont(fontName) {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    gMeme.lines[gMeme.selectedLineIdx].fontfam = fontName;
    renderCanvas();
    drawBorder();
}

function changeAlignText(alignDirection) {

    var currLine = gMeme.lines[gMeme.selectedLineIdx];
    var textWidth = gCtx.measureText(currLine.txt).width;
    if (!currLine.txt) return;
    if (alignDirection === 'left') {
        currLine.pos = { x: 20, y: currLine.pos.y }
    }
    else if (alignDirection === 'right') {
        currLine.pos = { x: gElCanvas.width - textWidth - 20, y: currLine.pos.y }
    }
    else if (alignDirection === 'center') {
        currLine.pos = { x: gElCanvas.width / 2 - textWidth / 2, y: currLine.pos.y }
    }

    currLine.txtAlign = alignDirection;

    renderCanvas();
    drawBorder();
}

function onChangeFillColor(color) {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    gCtx.fillStyle = color;
    gMeme.lines[gMeme.selectedLineIdx].fillclr = color;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);

}
function onChangeTextColor(color) {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    gCtx.strokeStyle = color;
    gMeme.lines[gMeme.selectedLineIdx].txtclr = color;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
}

function drawText(text, x, y, idx = -1) {
    if (idx === -1) var lineIdx = gMeme.selectedLineIdx;
    else lineIdx = idx;

    gCtx.lineWidth = 2;
    gCtx.font = `${gMeme.lines[lineIdx].size}px ${gMeme.lines[lineIdx].fontfam}`;

    // if(gMeme.lines[lineIdx].txtAlign === 'center') gCtx.textAlign = gMeme.lines[lineIdx].txtAlign;

    gCtx.fillStyle = gMeme.lines[lineIdx].fillclr;
    gCtx.fillText(text, x, y);
    gCtx.strokeStyle = gMeme.lines[lineIdx].txtclr;
    gCtx.strokeText(text, x, y);
}

function draw(ev) {
    const pos = getEvPos(ev);
    if (!isTextClicked(pos)) return;
    const { offsetX, offsetY } = ev;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, offsetX, offsetY)
}

function changeFontSize(upOrDown) {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    if (upOrDown === 'up') gMeme.lines[gMeme.selectedLineIdx].size += 10;
    else gMeme.lines[gMeme.selectedLineIdx].size -= 10;

    renderCanvas();
    drawBorder();
}

function _makegImgs() {
    for (let i = 1; i <= 18; i++) {
        var img = {
            id: i,
            url: 'images/meme-square/' + i + '.jpg',
            keywords: null
        }
        gImgs.push(img);
    }
}


function resizeCanvas() {
    var elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth;
    gElCanvas.height = elContainer.offsetHeight;
}