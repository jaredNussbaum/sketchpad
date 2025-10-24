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
