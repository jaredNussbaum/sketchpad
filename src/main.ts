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

let line_thickness: number = 4;
type Tool =
  | { type: "marker"; thickness: number }
  | { type: "sticker"; emoji: string };

let currently_used_tool: Tool = { type: "marker", thickness: line_thickness };

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

class StickerCommand implements DisplayCommand {
  x: number;
  y: number;
  emoji: string;

  constructor(initial: Point, emoji: string) {
    this.x = initial.x;
    this.y = initial.y;
    this.emoji = emoji;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "32px sans-serif";
    ctx.globalAlpha = 1.0;
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// CODE
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
    if (currently_used_tool.type === "marker") {
      render.beginPath();
      render.lineWidth = 1;
      render.strokeStyle = "gray";
      render.arc(
        circle_preview.x,
        circle_preview.y,
        currently_used_tool.thickness,
        0,
        Math.PI * 2,
      );
      render.stroke();
    } else if (currently_used_tool.type === "sticker") {
      render.font = "32px sans-serif";
      render.globalAlpha = 0.5;
      render.fillText(
        currently_used_tool.emoji,
        circle_preview.x,
        circle_preview.y,
      );
      render.globalAlpha = 1.0;
    }
  }
});

canvas.addEventListener("mousedown", (pos) => {
  const canvas_rect = canvas.getBoundingClientRect();
  const starting_point: Point = {
    x: pos.clientX - canvas_rect.left,
    y: pos.clientY - canvas_rect.top,
  };

  if (currently_used_tool.type === "marker") {
    last_stroke = new MarkerCommand(
      starting_point,
      currently_used_tool.thickness,
    );
    sketch.push(last_stroke);
    drawing = true;
  } else if (currently_used_tool.type === "sticker") {
    last_stroke = new StickerCommand(starting_point, currently_used_tool.emoji);
    sketch.push(last_stroke);
    drawing = true; // allow repositioning via drag
  }
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
thin.textContent = "TOOL: Thin Marker";
thin.addEventListener("click", () => {
  line_thickness = 4;
  currently_used_tool = { type: "marker", thickness: line_thickness };
});

const thick = document.createElement("button");
thick.textContent = "TOOL: Thick Marker";
thick.addEventListener("click", () => {
  line_thickness = 8;
  currently_used_tool = { type: "marker", thickness: line_thickness };
});
drawingDiv.appendChild(thin);
drawingDiv.appendChild(thick);

const stickerDiv = document.createElement("div");
drawingDiv.id = "stickerPanel";
document.body.append(stickerDiv);
const stickers = ["🐴", "🍎", "🥕", "🍪"];

for (const i of stickers) {
  const btn = document.createElement("button");
  btn.textContent = i;
  btn.addEventListener("click", () => {
    currently_used_tool = { type: "sticker", emoji: i };
    canvas.dispatchEvent(new Event(TOOL_MOVED));
  });
  document.body.appendChild(btn);
}
