'use strict';

var gElCanvas = document.getElementById('my-canvas');
var gCtx;
var gImgs = [];
var gMeme;
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
    window.addEventListener('resize', () => {
        resizeCanvas()
        renderCanvas()
    })
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
    if (!gMeme.lines[gMeme.selectedLineIdx]) return;
    var text;
    text = document.getElementById('text-line').value;
    drawText(text, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
    gMeme.lines[gMeme.selectedLineIdx].txt = text;
    renderCanvas();
    drawBorder();
}

function onDown(ev) {
    console.log(ev);
    const pos = getEvPos(ev);
    if (!isTextClicked(pos)) return;

    document.getElementById('text-line').value = gMeme.lines[gMeme.selectedLineIdx].txt;
    document.getElementById('font-change').value = gMeme.lines[gMeme.selectedLineIdx].fontfam;

    gMeme.lines[gMeme.selectedLineIdx].isDragging = true;
    gStartPos = pos;
}

function isTextClicked(clickedPos) {
    for (let i = 0; i < gMeme.lines.length; i++) {
        let currLine = gMeme.lines[i];
        console.log('currLine' , currLine )
        let textWidth = gCtx.measureText(currLine.txt).width;
        if (clickedPos.x >= currLine.pos.x - textWidth / 4 &&
            clickedPos.x <= currLine.pos.x - textWidth / 4 + textWidth * 1.5 &&
            clickedPos.y >= currLine.pos.y - currLine.size &&
            clickedPos.y <= currLine.pos.y - currLine.size + currLine.size * 1.5) {
            gMeme.selectedLineIdx = i;
            console.log('i', i);
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
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height);
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

    gCtx.strokeStyle = '#000000';
    gCtx.fillStyle = '#FFFFFF';

    if (imgId) {
        gMeme =
        {
            selectedImgId: 0,
            selectedLineIdx: 0,
            lines: [
                {
                    txt: '',
                    pos: { x: (gElCanvas.width / 2), y: 40 },
                    isDragging: false,
                    size: 40,
                    txtclr: '#000000',
                    fillclr: '#FFFFFF',
                    fontfam: 'impact',
                    txtAlign: 'center'
                }
            ]
        }
        gMeme.selectedImgId = imgId;
        gCurrImage = gImgs.find(image => image.id === imgId);

        document.getElementById('font-change').value = 'impact';
        document.getElementById('text-line').value = '';

        const img = new Image()
        img.src = gCurrImage.url;
        img.onload = () => {
            gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        }
    }

    resizeCanvas();
    renderCanvas();
}

function goToGallery() {
    document.querySelector('.gallery-section').style.display = 'block';
    document.querySelector('.meme-editor-section').style.display = 'none';
}

function clearCanvas() {
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height);
    document.getElementById('font-change').value = 'impact';
    document.getElementById('text-line').value = '';
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
            txtclr: '#000000',
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
    drawBorder();
}

function addNewLine() {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;
    renderCanvas();
    document.getElementById('text-line').focus();
    gMeme.selectedLineIdx = gMeme.lines.length;

    document.getElementById('text-line').value = '';
    if (gMeme.selectedLineIdx >= 1) {//if it's the second line that is added
        gMeme.lines.push({
            txt: '',
            pos: { x: (gElCanvas.width / 2), y: (gElCanvas.height - 40) },
            isDragging: false,
            size: 40,
            txtclr: '#000000',
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
    renderCanvas();
    drawBorder();
}
function onChangeTextColor(color) {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    gCtx.strokeStyle = color;
    gMeme.lines[gMeme.selectedLineIdx].txtclr = color;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
    renderCanvas();
    drawBorder();
}

function drawText(text, x, y, idx = -1) {
    if (idx === -1) var lineIdx = gMeme.selectedLineIdx;
    else lineIdx = idx;

    gCtx.lineWidth = 2;
    gCtx.font = `${gMeme.lines[lineIdx].size}px ${gMeme.lines[lineIdx].fontfam}`;

    gCtx.fillStyle = gMeme.lines[lineIdx].fillclr;
    gCtx.fillText(text, x, y);
    gCtx.strokeStyle = gMeme.lines[lineIdx].txtclr;
    gCtx.strokeText(text, x, y);
}

function changeFontSize(upOrDown) {
    if (!gMeme.lines[gMeme.selectedLineIdx].txt) return;

    if (upOrDown === 'up') gMeme.lines[gMeme.selectedLineIdx].size += 10;
    else gMeme.lines[gMeme.selectedLineIdx].size -= 10;

    renderCanvas();
    drawBorder();
}


function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container');
    // Note: changing the canvas dimension this way clears the canvas
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
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