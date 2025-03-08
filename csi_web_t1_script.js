// Get elements
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const brushColorInput = document.getElementById('brush-color');
const brushSizeInput = document.getElementById('brush-size');
const textInput = document.getElementById('text-input');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const recognizeBtn = document.getElementById('recognize-btn');
const recognitionResultDiv = document.getElementById('recognition-result');

// Canvas setup
canvas.width = 800;
canvas.height = 600;
let drawing = false;
let brushColor = "#000000";
let brushSize = 4;
let x = 0;
let y = 0;

// Event listeners
brushColorInput.addEventListener('input', (e) => {
  brushColor = e.target.value;
});

brushSizeInput.addEventListener('input', (e) => {
  brushSize = e.target.value;
});

textInput.addEventListener('input', (e) => {
  drawText(e.target.value);
});

canvas.addEventListener('mousedown', (e) => startDrawing(e));
canvas.addEventListener('mousemove', (e) => draw(e));
canvas.addEventListener('mouseup', () => stopDrawing());
canvas.addEventListener('mouseleave', () => stopDrawing());

// Draw functions
function startDrawing(e) {
  drawing = true;
  [x, y] = [e.offsetX, e.offsetY];
}

function draw(e) {
  if (!drawing) return;

  ctx.beginPath();
  ctx.moveTo(x, y);
  [x, y] = [e.offsetX, e.offsetY];
  ctx.lineTo(x, y);
  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
}

function drawText(text) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = brushColor;
  ctx.font = `${brushSize * 2}px Arial`;
  ctx.fillText(text, 50, 100);
}

// Clear canvas
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  recognitionResultDiv.innerHTML = '';
});

// Save drawing
saveBtn.addEventListener('click', () => {
  const dataUrl = canvas.toDataURL();
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'drawing.png';
  link.click();
});

// Recognize drawing using an AI API (Gemini API example)
recognizeBtn.addEventListener('click', async () => {
  const dataUrl = canvas.toDataURL();
  try {
    const response = await fetch('https://api.gemini.ai/analyze', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: dataUrl,
      }),
    });
    const result = await response.json();
    recognitionResultDiv.innerHTML = `AI Recognition: ${result.description}`;
  } catch (error) {
    recognitionResultDiv.innerHTML = 'Recognition failed. Please try again.';
    console.error(error);
  }
});
