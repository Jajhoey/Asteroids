const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('start');

canvas.width = 400;
canvas.height = 300;
canvas.border = 1px;

const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  angle: 90,
  velocity: {
    x: 0,
    y: 0
  },
  rotation: 0,
  thrusting: false
};

function drawShip() {
  context.beginPath();
  context.moveTo(
    ship.x + 4 / 3 * ship.radius * Math.cos(ship.angle),
    ship.y - 4 / 3 * ship.radius * Math.sin(ship.angle)
  );
  context.lineTo(
    ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
    ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) - Math.cos(ship.angle))
  );
  context.lineTo(
    ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
    ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) + Math.cos(ship.angle))
  );
  context.closePath();
  context.stroke();
}

function clearCanvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
  drawShip();
}

function startGame(){
  setInterval(update, 1000 / 60);
}

startButton.addEventListener('click', startGame);
