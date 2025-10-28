import "./style.css";

const title = document.createElement("h1");
title.textContent = "Sticker Sketchad";
document.body.appendChild(title);

const canvas = document.createElement("canvas");

canvas.id = "Canvas";
canvas.width = 256;
canvas.height = 256;
const render = canvas.getContext("2d")!;
render.lineWidth = 4;
render.lineCap = "round";
render.strokeStyle = "black";
document.body.appendChild(canvas);

let drawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  render.beginPath();
  render.moveTo(lastX, lastY);
  render.lineTo(x, y);
  render.stroke();
  lastX = x;
  lastY = y;
});

["mouseup", "mouseleave"].forEach((eventType) => {
  canvas.addEventListener(eventType, () => (drawing = false));
});

const clear = document.createElement("button");
clear.textContent = "Clear";
clear.addEventListener("click", () => {
  render.clearRect(0, 0, canvas.width, canvas.height);
});
document.body.appendChild(clear);

const undo = document.createElement("button");
undo.textContent = "Undo";
undo.addEventListener("click", () => {
  //undo
});
document.body.appendChild(clear);

const redo = document.createElement("button");
redo.textContent = "Redo";
redo.addEventListener("click", () => {
  //redo
});

document.body.appendChild(clear);
document.body.appendChild(undo);
document.body.appendChild(redo);
