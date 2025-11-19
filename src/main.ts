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
let line_thickness: number = 4;
let drawing = false;

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

// Interfaces
interface DisplayCommand {
  display(ctx: CanvasRenderingContext2D): void;
  drag?(x: number, y: number): void;
}
class MarkerCommand implements DisplayCommand {
  points: Point[] = [];
  thickness: number;

  constructor(initial: Point, thickness = 4) {
    this.points.push(initial);
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) {
      const p = this.points[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, this.thickness / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.lineWidth = this.thickness;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.stroke();
  }
}

const clear = document.createElement("button");
clear.textContent = "Clear";
clear.addEventListener("click", () => {
  last_stroke = null;
  sketch = [];
  render.clearRect(0, 0, canvas.width, canvas.height);
});
document.body.appendChild(clear);

type Point = { x: number; y: number };
let sketch: DisplayCommand[] = [];
let last_stroke: DisplayCommand | null = null;
let circle_preview: Point = { x: 0, y: 0 };

const DRAWING_CHANGED = "DRAWING_CHANGED";
const TOOL_MOVED = "TOOL_MOVED";

canvas.addEventListener(DRAWING_CHANGED, () => {
  render.clearRect(0, 0, 256, 256);
  for (const line of sketch) {
    line.display(render);
  }
  if (circle_preview && !drawing) {
    render.beginPath();
    render.lineWidth = 1;
    render.strokeStyle = "black";
    render.arc(
      circle_preview.x,
      circle_preview.y,
      line_thickness,
      0,
      Math.PI * 2,
    );
    render.stroke();
  }
});

canvas.addEventListener("mousedown", (pos) => {
  const canvas_rect = canvas.getBoundingClientRect();
  const starting_point: Point = {
    x: pos.clientX - canvas_rect.left,
    y: pos.clientY - canvas_rect.top,
  };

  last_stroke = new MarkerCommand(starting_point, line_thickness);
  sketch.push(last_stroke);
  drawing = true;
});

canvas.addEventListener("mousemove", (pos) => {
  const canvas_rect = canvas.getBoundingClientRect();
  const x = pos.clientX - canvas_rect.left;
  const y = pos.clientY - canvas_rect.top;
  circle_preview = { x, y };
  canvas.dispatchEvent(new Event(TOOL_MOVED));
  if (!drawing) return;
  last_stroke!.drag!(x, y);
});

["mouseup", "mouseleave"].forEach((event) =>
  canvas.addEventListener(event, () => (drawing = false))
);
canvas.addEventListener(TOOL_MOVED, () => {
  canvas.dispatchEvent(new Event(DRAWING_CHANGED));
});

// STACK
const stack: DisplayCommand[] = [];

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

const drawingDiv = document.createElement("div");
drawingDiv.id = "buttonPanel";
document.body.append(drawingDiv);

const thin = document.createElement("button");
thin.textContent = "Thin Marker";
thin.addEventListener("click", () => {
  line_thickness = 2;
});

const thick = document.createElement("button");
thick.textContent = "Thick Marker";
thick.addEventListener("click", () => {
  line_thickness = 8;
});
drawingDiv.appendChild(thin);
drawingDiv.appendChild(thick);
