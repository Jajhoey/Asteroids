const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('start');
const turn_speed = 360; //Degrees of rotation per second
const friction = 0.7; //Coefficient of friction in space

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ship_speed = canvas.width / 300;



const ship = {
  //Ship position
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
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

  //rotate the ship
  ship.angle += ship.rotation / 180 * Math.PI;
  ship.rotation = 0;
  //move ship
  if(ship.thrusting){
    ship.x += ship.velocity.x;
    ship.y -= ship.velocity.y;
    //force of friction
    ship.velocity.x -= friction * Math.cos(ship.angle);
    ship.velocity.y -= friction * Math.sin(ship.angle);
  }

  if (!ship.thrusting){
    ship.velocity.x = 0;
    ship.velocity.y = 0;
  }
}

function clearCanvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
  clearCanvas();
  drawShip();
}

function gameControls(){
  document.addEventListener('keydown', () => {
    switch (event.key) {
      case "ArrowUp":
        ship.thrusting = true;
        ship.velocity.x += ship_speed * Math.cos(ship.angle);
        ship.velocity.y += ship_speed * Math.sin(ship.angle);
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
      case "ArrowDown":
        ship.thrusting = false;
      default:
        return;
    }
  })
}

function startGame(){
  gameControls();
  setInterval(update, 1000 / 60); //Fps is 160th
}

//displayInstructions();
//startButton.addEventListener('click', startGame);
startGame();
