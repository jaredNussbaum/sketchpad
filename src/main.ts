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
let last_x = 0;
let last_y = 0;

/*canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  last_x = e.clientX - rect.left;
  last_y = e.clientY - rect.top;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  render.beginPath();
  render.moveTo(last_x, last_y);
  render.lineTo(x, y);
  render.stroke();
  last_x = x;
  last_y = y;
});

["mouseup", "mouseleave"].forEach((eventType) => {
  canvas.addEventListener(eventType, () => (drawing = false));
});
*/
const clear = document.createElement("button");
clear.textContent = "Clear";
clear.addEventListener("click", () => {
  last_stroke = [];
  sketch = [];
  render.clearRect(0, 0, canvas.width, canvas.height);
});
document.body.appendChild(clear);

type Point = { x: number; y: number };
let sketch: Point[][] = [];
let last_stroke: Point[] = [];

const DRAWING_CHANGED = "DRAWING_CHANGED";

canvas.addEventListener(DRAWING_CHANGED, () => {
  render.clearRect(0, 0, 256, 256);
  render.beginPath();
  for (const line of sketch) {
    if (line.length < 2) {
      continue;
    }
    render.moveTo(line[0].x, line[0].y);
    for (let i = 0; i < line.length; i++) {
      render.lineTo(line[i].x, line[i].y);
    }
    render.stroke();
  }
});

canvas.addEventListener("mousedown", (pos) => {
  const canvas_rect = canvas.getBoundingClientRect();
  last_stroke = [{
    x: pos.clientX - canvas_rect.left,
    y: pos.clientY - canvas_rect.top,
  }];
  sketch.push(last_stroke);
  drawing = true;
});

canvas.addEventListener("mousemove", (pos) => {
  if (!drawing) return;
  const canvas_rect = canvas.getBoundingClientRect();
  const x = pos.clientX - canvas_rect.left;
  const y = pos.clientY - canvas_rect.top;
  last_stroke.push({ x, y });
  canvas.dispatchEvent(new Event(DRAWING_CHANGED));
});

["mouseup", "mouseleave"].forEach((event) =>
  canvas.addEventListener(event, () => (drawing = false))
);

let stack: Point[][] = [];

const redo = document.createElement("button");
redo.textContent = "Redo";
redo.addEventListener("click", () => {
  //redo
  /*if (sketch.length == 0) return;*/
  const target = stack.pop()!;
  if (target) {
    sketch.push(target);
  }
  canvas.dispatchEvent(new Event(DRAWING_CHANGED));
});

const undo = document.createElement("button");
undo.textContent = "Undo";
undo.addEventListener("click", () => {
  //undo
  if (sketch.length == 0) return;
  const target = sketch.pop()!;
  if (target) {
    stack.push(target);
  }

  canvas.dispatchEvent(new Event(DRAWING_CHANGED));
});

document.body.appendChild(clear);
document.body.appendChild(undo);
document.body.appendChild(redo);
