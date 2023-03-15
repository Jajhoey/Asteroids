const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('start');
const turn_speed = 360; //Degrees of rotation per second
const friction = 0.7; //Coefficient of friction
const ship_acceleration = 10; //increase velocity by 5 pixels per second

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;




const ship = {
  //Ship position
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 40,
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
  context.stroke();

  //drawing thrust

}

function clearCanvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

//this update function is the main game loop
function update() {
    //rotate the ship
    ship.angle += ship.rotation / 180 * Math.PI;
    ship.rotation = 0;

    //move ship
    ship.x += ship.velocity.x;
    ship.y -= ship.velocity.y;

    if (ship.thrusting){
      ship.velocity.x += ship_acceleration * Math.cos(ship.angle) / 60;
      ship.velocity.y += ship_acceleration * Math.sin(ship.angle) / 60;

    }

   ship.velocity.x -= friction * ship.velocity.x / 60;
   ship.velocity.y -= friction * ship.velocity.y / 60;

   //check canvas boundaries for collision and warp ship to opposite side
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


  clearCanvas();
  drawShip();
}

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
  console.log(ship.x);
  console.log(ship.y);
  console.log(ship.thrusting);
  console.log(ship.rotation);
}

function startGame(){
  setInterval(test, 1000);
  setInterval(update, 1000 / 60); //Fps is 1/60th
}

//displayInstructions();
//startButton.addEventListener('click', startGame);
startGame();
