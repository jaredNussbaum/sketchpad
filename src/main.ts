import "./style.css";

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
