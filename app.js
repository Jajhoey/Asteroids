const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('start');

const turn_speed = 360; //Degrees of rotation per second
const friction = 0.7; //Coefficient of friction
const ship_acceleration = 20; //increase velocity by 20 pixels per second
const numAsteroids = 3;
let asteroids = [];


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;




const ship = {
  //Ship position
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 30,
  //Angle is defaulted to 90 (facing north). Angle is converted to radians
  //for the trig functions to work.
  angle: 90/180 * Math.PI,
  velocity: {
    x: 0,
    y: 0
  },
  rotation: 0,
  thrusting: false
};


function displayInstructions(){
  context.font = '50px Times New Roman';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText('Instructions', canvas.width/2, canvas.height/2 - 100);
  context.font = '20px Calibri';
  context.fillText('Use the arrow keys to rotate left and right. Use the up key to activate thrusters.', canvas.width/2, canvas.height/2);
  context.fillText("Spacebar is used to shoot the ship's gun.", canvas.width/2, canvas.height/2 + 30);

}

function drawShip() {
  context.strokeStyle = '#fafafa';
  context.lineWidth = ship.radius / 15;
  context.beginPath();
  context.moveTo(//ship's nose
    ship.x + ship.radius * Math.cos(ship.angle),
    ship.y - ship.radius * Math.sin(ship.angle)
  );
  context.lineTo(//drawing to bottom left of ship
    ship.x - ship.radius * (Math.cos(ship.angle) + Math.sin(ship.angle)),
    ship.y + ship.radius * (Math.sin(ship.angle) - Math.cos(ship.angle))
  );
  context.lineTo(//drawing to bottom right
    ship.x - ship.radius * (Math.cos(ship.angle) - Math.sin(ship.angle)),
    ship.y + ship.radius * (Math.sin(ship.angle) + Math.cos(ship.angle))
  );
  context.closePath(); //drawing back to the nose
  context.fill();
  context.stroke();

  //drawing thrust
  if (ship.thrusting) {
    context.fillStyle = '#50d4c9';
    context.strokeStyle = '#e88e2e';
    context.lineWidth = ship.radius / 5;
    context.beginPath();
    context.moveTo(//tip of thrust
      ship.x - 2 * ship.radius * Math.cos(ship.angle),
      ship.y + 2 * ship.radius * Math.sin(ship.angle)
    );
    context.lineTo(//drawing to bottom left of ship
      ship.x - ship.radius * (Math.cos(ship.angle) + Math.sin(ship.angle)/3),
      ship.y + ship.radius * (Math.sin(ship.angle) - Math.cos(ship.angle)/3)
    );
    context.lineTo(//drawing to bottom right
      ship.x - ship.radius * (Math.cos(ship.angle) - Math.sin(ship.angle)/3),
      ship.y + ship.radius * (Math.sin(ship.angle) + Math.cos(ship.angle)/3)
    );
    context.closePath(); //drawing back to the tip of thrust
    context.fill();
    context.stroke();
  }
}

function drawAsteroids(){
  //drawing asteroids
  for (var i = 0; i < asteroids.length; i++){
    ast = asteroids[i];
    context.strokeStyle = 'white';
    context.lineWidth = ship.radius / 15;
    context.beginPath();
    context.moveTo(
      ast.x - ast.radius * ast.vertJaggedness[0] * Math.cos(ast.angle),
      ast.y + ast.radius * ast.vertJaggedness[0] * Math.sin(ast.angle));
    for(var j = 1; j <= ast.vertices; j++){
      context.lineTo(
        ast.x - ast.radius * ast.vertJaggedness[j] * Math.cos(ast.angle + j * Math.PI * 2 / ast.vertices),
        ast.y + ast.radius * ast.vertJaggedness[j] * Math.sin(ast.angle + j * Math.PI * 2 / ast.vertices)
      );
    }
    context.closePath();
    context.stroke();
  }
}

function newAsteroid(){
  const asteroid = {
    x: 0,
    y: 0,
    radius: ship.radius*2,
    angle: 90/180 * Math.PI,
    velocity: {
      x: Math.random() * 5,
      y: Math.random() * 5
    },
    rotation: (Math.random() * 10 - 5) / 180 * Math.PI,
    vertices: 5 + Math.random() * 10,
    vertJaggedness: []
  }
  for (var i = 0; i < asteroid.vertices; i++) {
    asteroid.vertJaggedness.push(Math.random()+1);
  }
  do {//reset the coords until the distance is larger than 5x asteroid radius
    asteroid.x = Math.random() * canvas.width;
    asteroid.y = Math.random() * canvas.height;
  } while (distanceBetweenPoints(ship.x, ship.y, asteroid.x, asteroid.y) < asteroid.radius * 5 );
  return asteroid;
}

function createAsteroids(){
  //pushing Asteroids
  for (var i = 0; i < numAsteroids; i++){
    ast = newAsteroid();
    asteroids.push(ast);
  }
}

function distanceBetweenPoints(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}// d=√((x2 – x1)² + (y2 – y1)²)

function clearCanvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

//this update function is the main game loop
function update() {
    //rotate the ship and asteroids
    ship.angle += ship.rotation / 180 * Math.PI;
    ship.rotation = 0;
    for (var i = 0; i < asteroids.length; i++) {
      asteroids[i].angle += asteroids[i].rotation;
    }
    //move ship and asteroids
    ship.x += ship.velocity.x;
    ship.y -= ship.velocity.y;
    for (var i = 0; i < asteroids.length; i++) {
      asteroids[i].x += asteroids[i].velocity.x;
      asteroids[i].y -= asteroids[i].velocity.y;
    }

    if (ship.thrusting){
      ship.velocity.x += ship_acceleration * Math.cos(ship.angle) / 60;
      ship.velocity.y += ship_acceleration * Math.sin(ship.angle) / 60;

    }

   ship.velocity.x -= friction * ship.velocity.x / 60;
   ship.velocity.y -= friction * ship.velocity.y / 60;




  clearCanvas();
  drawShip();
  drawAsteroids();
  boundaryCheck();
}

function boundaryCheck(){
  //check canvas boundaries for collision and warp ship or asteroids to opposite side
  if (ship.x - ship.radius < 0){
    ship.x = canvas.width - ship.radius;
  }else if (ship.x + ship.radius > canvas.width) {
    ship.x = 0 + ship.radius;
  }

  if (ship.y - ship.radius < 0) {
    ship.y = canvas.height - ship.radius;
  }else if (ship.y + ship.radius > canvas.height) {
    ship.y = 0 + ship.radius;
  }

  for (var i = 0; i < asteroids.length; i++) {
    if (asteroids[i].x - asteroids[i].radius < 0){
      asteroids[i].x = canvas.width - asteroids[i].radius;
    }else if (asteroids[i].x + asteroids[i].radius > canvas.width) {
      asteroids[i].x = 0 + asteroids[i].radius;
    }

    if (asteroids[i].y - asteroids[i].radius < 0) {
      asteroids[i].y = canvas.height - asteroids[i].radius;
    }else if (asteroids[i].y + asteroids[i].radius > canvas.height) {
      asteroids[i].y = 0 + asteroids[i].radius;
    }
  }
}

createAsteroids();


//Event handlers for game controls
document.addEventListener('keydown', () => {
  switch (event.key) {
    case "ArrowUp":
      ship.thrusting = true;
      break;
    case "ArrowLeft":
      ship.rotation += turn_speed/60;
      break;
    case "ArrowRight":
      ship.rotation -= turn_speed/60;
      break;
    case " ":
    console.log("Shoot");
      break;
    default:
      return;
  }
});

document.addEventListener('keyup', () => {
  switch (event.key) {
    case 'ArrowUp':
      ship.thrusting = false;
      break;
    case 'ArrowLeft':
      ship.rotation = 0;
      break;
    case 'ArrowRight':
      ship.rotation = 0;
      break;
    default:

  }
});

//debugging
function test(){

}

function startGame(){
  setInterval(test, 1000);
  setInterval(update, 1000 / 60); //Fps is 1/60th
}

//displayInstructions();
//startButton.addEventListener('click', startGame);
startGame();
