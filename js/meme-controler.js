'use strict';

var gElCanvas = document.getElementById('my-canvas');
var gCtx;
var gImgs = [];
var gMeme =
{
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [
        {
            txt: '',
            pos: { x: (gElCanvas.width / 2), y: 40 },
            isDragging: false,
            size: 40,
        },
        {
            txt: '',
            pos: { x: (gElCanvas.width / 2), y:  (gElCanvas.height - 40) },
            isDragging: false,
            size: 40,
        }
    ]
}


var gStartPos;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
var gKeywords = { 'happy': 5, 'funny': 12, 'dog': 3 };
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

function insertTextLine(lineNum) {
    var text;
    if (lineNum === 0) text = document.getElementById('text-line').value;
    else text = document.getElementById('second-text-line').value;

    drawText(text, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
    gMeme.selectedLineIdx = lineNum;
    gMeme.lines[gMeme.selectedLineIdx].txt = text;
    renderCanvas();
}

function onDown(ev) {
    const pos = getEvPos(ev)
    gMeme.lines[gMeme.selectedLineIdx].isDragging = true;
    gStartPos = pos;

    gMeme.lines[gMeme.selectedLineIdx].pos.x = pos.x;
    gMeme.lines[gMeme.selectedLineIdx].pos.y = pos.y;

    document.body.style.cursor = 'grabbing';
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

function onUp(ev) {
    gMeme.lines[gMeme.selectedLineIdx].isDragging = false;
    document.body.style.cursor = 'grab';

    const pos = getEvPos(ev)
    gMeme.lines[gMeme.selectedLineIdx].pos.x = pos.x;
    gMeme.lines[gMeme.selectedLineIdx].pos.y = pos.y;
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
    console.log('gMeme.lines', gMeme.lines)
    for (var i = 0; i < gMeme.lines.length; i++) {
        drawText(gMeme.lines[i].txt, gMeme.lines[i].pos.x, gMeme.lines[i].pos.y);
        console.log(`gMeme.lines[${i}].txt`, gMeme.lines[i].txt);
    }
}

function initCanvas(imgId) {
    gCtx = gElCanvas.getContext('2d');

    var initTextColor = document.getElementById("text-color").value;
    gCtx.strokeStyle = initTextColor;
    var initFillColor = document.getElementById("fill-color").value;
    gCtx.fillStyle = initFillColor;

    addListeners();

    document.querySelector('.gallery-section').style.display = 'none';
    document.querySelector('.meme-editor-section').style.display = 'block';

    if (imgId) {
        gMeme.selectedImgId = imgId;
        document.querySelector('.gallery-section').style.display = 'none';
        document.querySelector('.meme-editor-section').style.display = 'block';

        gCurrImage = gImgs.find(image => image.id === imgId);

        const img = new Image()
        img.src = gCurrImage.url;
        img.onload = () => {
            gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        }
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

function downloadCanvas(elLink) {
    const data = gElCanvas.toDataURL();
    elLink.href = data;
    elLink.download = 'myCanvas';
}

function onChangeFillColor(color) {
    gCtx.fillStyle = color;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);

}
function onChangeTextColor(color) {
    gCtx.strokeStyle = color;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
}

function drawText(text, x, y) {
    gCtx.lineWidth = 1;
    gCtx.font = `${gMeme.lines[gMeme.selectedLineIdx].size}px impact`;
    gCtx.textAlign = 'center';
    gCtx.fillText(text, x, y);
    gCtx.strokeText(text, x, y);
}

function draw(ev) {
    const { offsetX, offsetY } = ev;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, offsetX, offsetY)
    gMeme.lines[gMeme.selectedLineIdx].pos.x = offsetX;
    gMeme.lines[gMeme.selectedLineIdx].pos.y = offsetY;
}

function changeFontSize(upOrDown) {
    if (upOrDown === 'up') gMeme.lines[gMeme.selectedLineIdx].size += 10;
    else gMeme.lines[gMeme.selectedLineIdx].size -= 10;
    drawText(gMeme.lines[gMeme.selectedLineIdx].txt, gMeme.lines[gMeme.selectedLineIdx].pos.x, gMeme.lines[gMeme.selectedLineIdx].pos.y);
    renderCanvas();
}

function updateSelectedLineIdx(lineIdx){
    gMeme.selectedLineIdx = lineIdx;
    console.log('lineIdx on click', lineIdx);
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