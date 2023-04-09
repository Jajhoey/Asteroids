const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('start');
const retryButton = document.getElementById('retry');
retryButton.classList.add('hidden')

const turn_speed = 1080; //Degrees of rotation per second
const friction = 0.7; //Coefficient of friction
const ship_acceleration = 20; //increase velocity by 20 pixels per second
const rateOfFire = 3; // 3 shots per sec
const bulletVel = 20; //pixels per sec
const FPS = 60;
const explodeDur = 1; //explode for 1 sec
const blinkDur = 3; //blink for 3 sec (invincibility)
const levelDisplayDur = 2; //2 sec
const restart = false;

var numAsteroids = 3;
var level = 0;
var currentLives = 3;
var score = 0;
var highScore = localStorage.highScore
var tAlpha = 0; //decrease this to fade out level display
let lasers = [];
let asteroids = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ship = newShip();
var shipLife = {
  x: ship.radius * 2,
  y: ship.radius * 2,
  angle: 90 / 180 * Math.PI,
  radius: ship.radius
}


function displayInstructions(){
  context.font = '50px Times New Roman';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText('Instructions', canvas.width/2, canvas.height/2 - 100);
  context.font = '20px Calibri';
  context.fillText('Use the arrow keys to rotate left and right. Use the up key to activate thrusters.', canvas.width/2, canvas.height/2);
  context.fillText("Hold SPACE to shoot lasers!", canvas.width/2, canvas.height/2 + 30);
}

function newShip(){
  return {
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
    thrusting: false,
    firing: false,
    explodeTime: 0,
    blinking: false,
    blinkTime: 0
  }
}

function drawShip(e, b) {
  //only draw (in white) when not exploding or blinking
  if (!e) {
    switch (b) {
      case true:
        context.strokeStyle = '#fafafa';
        break;
      case false:
        context.strokeStyle = 'black';
        break;
      default:

    }
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
  }else {
    drawExplode(ship.x, ship.y, ship.radius);
  }
}

function drawExplode(x, y, r){
  //draw explosion
  context.strokeStyle = 'red';
  context.lineWidth = r / 2;
  context.fillStyle = 'orange';
  context.beginPath();
  context.arc(x, y + 10, r * 1.5, 0, Math.PI * 2);
  context.stroke();
  context.fill();
  context.closePath();
  context.strokeStyle = 'yellow'
  context.lineWidth = r / 2;
  context.fillStyle = 'white';
  context.beginPath();
  context.arc(x, y + 10, r, 0, Math.PI * 2);
  context.stroke();
  context.fill();
  context.closePath();
}

function drawLasers(e){
  if (lasers.length>0) {
    for (var i = 0; i < lasers.length; i++) {
      context.strokeStyle = 'red';
      context.lineWidth = ship.radius / 15;
      context.beginPath();
      context.moveTo(
        lasers[i].x + ship.radius * Math.cos(lasers[i].angle),
        lasers[i].y - ship.radius * Math.sin(lasers[i].angle)
      );
      context.lineTo(
        lasers[i].x + 5 * Math.cos(lasers[i].angle),
        lasers[i].y - 5 * Math.sin(lasers[i].angle)
      );
      context.closePath();
      context.fill();
      context.stroke();
    }
  }
}

function newLaser(x, y, a){
  const laser = {
    x: x,
    y: y,
    angle: a,
    velocity: {
      x: bulletVel,
      y: bulletVel
    }
  }
  return laser;
}

function createLasers(){
  if (ship.firing && ship.explodeTime == 0) {
    let laser = newLaser(ship.x, ship.y, ship.angle);
    lasers.push(laser);
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

function newAsteroid(astDebris){
  const asteroid = {
    x: 0,
    y: 0,
    radius: ship.radius*2,
    angle: 90/180 * Math.PI,
    velocity: { //below syntax is multiplying by 1 if < 0.5, else multiply by -1
      x: (Math.random() < .5 ? 1 : -1) * 1.5,
      y: (Math.random() < .5 ? 1 : -1) * 1.5
    },
    rotation: (Math.random() * 10 - 5) / 180 * Math.PI,
    vertices: 5 + Math.random() * 10,
    vertJaggedness: [],
  }
  for (var i = 0; i < asteroid.vertices; i++) {
    asteroid.vertJaggedness.push(Math.random()+1);
  }
  if (!astDebris) {
    do {//reset the coords until the distance from ship is larger than 5x asteroid radius for inital spawn
      asteroid.x = Math.random() * canvas.width;
      asteroid.y = Math.random() * canvas.height;
    } while (distanceBetweenPoints(ship.x, ship.y, asteroid.x, asteroid.y) < asteroid.radius * 5);
  }
  return asteroid;
}

function createAsteroids(){
  //initial creation of asteroids at start of level
  numAsteroids += level;

  for (var i = 0; i < numAsteroids; i++){
    ast = newAsteroid(false);
    asteroids.push(ast);
  }
}

function astExplode(ast){
  if (ast.radius > ship.radius / 2) {
     for (var i = 0; i < 2; i++) {
       var a = newAsteroid(true);
       a.x = ast.x;
       a.y = ast.y;
       a.radius = ast.radius/2;
       asteroids.push(a);
     }
   }
  asteroids.splice(asteroids.indexOf(ast), 1);
}

function drawLives(last){
  for(var i = 0; i < currentLives; i++){
    //drawing each of the 3 lives, they are spaced out 
    shipLife.x = shipLife.radius * (2 + (i * 2.5));
    switch (last) {
      case true:
        context.strokeStyle = 'red';
        break;
      default:
        context.strokeStyle = 'white';
        break;
    }

    context.lineWidth = ship.radius / 15;
    context.beginPath();
    context.moveTo(//ship's nose
      shipLife.x + shipLife.radius * Math.cos(shipLife.angle),
      shipLife.y - shipLife.radius * Math.sin(shipLife.angle)
    );
    context.lineTo(//drawing to bottom left of ship
      shipLife.x - shipLife.radius * (Math.cos(shipLife.angle) + Math.sin(shipLife.angle)),
      shipLife.y + shipLife.radius * (Math.sin(shipLife.angle) - Math.cos(shipLife.angle))
    );
    context.lineTo(//drawing to bottom right
      shipLife.x - shipLife.radius * (Math.cos(shipLife.angle) - Math.sin(shipLife.angle)),
      shipLife.y + shipLife.radius * (Math.sin(shipLife.angle) + Math.cos(shipLife.angle))
    );
    context.closePath(); //drawing back to the nose
    context.stroke();
  }
}

function drawHighScore(){
  if (highScore != null){
    context.font = '50px Times New Roman';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText('High Score: ' + highScore, canvas.width/2, ship.radius * 2);
  }
}

function drawScore(){
  context.font = '50px Times New Roman';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText('Score: ' + score, canvas.width - ship.radius *  5, ship.radius * 2);
}

function displayLevel(){
  if (tAlpha > 0 && currentLives > 0){
    context.font = '50px Times New Roman';
    context.fillStyle = 'rgba(255, 255, 255, ' + tAlpha + ')';
    context.textAlign = 'center';
    context.fillText('Level ' + level, canvas.width / 2, canvas.height / 4);
  }
}

function nextLevel(){
  if(currentLives > 0){
    createAsteroids();
    level += 1;
  }
}

function gameOver(){
  context.font = '50px Calibri';
  context.fillStyle = 'red';
  context.textAlign = 'center';
  context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  context.font = '30px Times New Roman';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText("You made it to " + 'level ' + level, canvas.width / 2, canvas.height * 3/4);
  
  while(asteroids.length > 1){
    asteroids.splice(0, asteroids.length);
  }

  retryButton.classList.remove('hidden');
}

function distanceBetweenPoints(x1, y1, x2, y2){// d=√((x2 – x1)² + (y2 – y1)²)
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function clearCanvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function showBounds(){
  //make some hitboxes
  context.strokeStyle = "green";
  context.lineWidth = ship.radius / 15;
  context.beginPath();
  context.arc(ship.x, ship.y + 10, ship.radius + 5, 0, Math.PI * 2);
  context.closePath();
  context.stroke();

  for (var i = 0; i < asteroids.length; i++) {
    context.strokeStyle = "green";
    context.lineWidth = ship.radius / 15;
    context.beginPath();
    context.arc(asteroids[i].x, asteroids[i].y, asteroids[i].radius * 1.25, 0, Math.PI * 2);
    context.closePath();
    context.stroke();
  }
}

function boundaryWarp(){
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

  if (lasers.length > 0) {
    for (var i = 0; i < lasers.length; i++) {
      if (lasers[i].x > canvas.width || lasers[i].x < 0) {
        lasers.splice(i, 1);
      }
      if (lasers[i].y > canvas.height || lasers[i].y < 0) {
        lasers.splice(i, 1);
      }
    }
  }
}

var astExp = {
  x: 0,
  y: 0,
  r: 0,
  dur: 0
}
//this update function is the main game loop
function update() {
  var isExploding = ship.explodeTime > 0;
  var blink = ship.blinkTime % 5 == 0; //this line is tied to the frequency of blinking. Ship will blink on multiples of 5
  var last = currentLives == 1;
  
  //rotate the ship and asteroids
  ship.angle += ship.rotation / 180 * Math.PI;
  ship.rotation = 0;
  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].angle += asteroids[i].rotation;
  }

  //move ship, asteroids, lasers
  if (!isExploding){
    ship.x += ship.velocity.x;
    ship.y -= ship.velocity.y;
  }

  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].x += asteroids[i].velocity.x;
    asteroids[i].y -= asteroids[i].velocity.y;
  }

  for (var i = 0; i < lasers.length; i++) {
    lasers[i].x += bulletVel * Math.cos(lasers[i].angle)
    lasers[i].y -= bulletVel * Math.sin(lasers[i].angle)
  }

  if (ship.thrusting){
    ship.velocity.x += ship_acceleration * Math.cos(ship.angle) / 60;
    ship.velocity.y += ship_acceleration * Math.sin(ship.angle) / 60;
  }

  ship.velocity.x -= friction * ship.velocity.x / 60;
  ship.velocity.y -= friction * ship.velocity.y / 60;

  //If the ship isn't exploding or blinking, check for asteroid collisions w ship
  if (!isExploding && !ship.blinking) {
    for (var i = 0; i < asteroids.length; i++) {
      if (distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < 5 + ship.radius + asteroids[i].radius * 1.25) {
        ship.explodeTime = explodeDur * FPS;
      }
    }
  }

  //If the ship is exploding then reduce explode time
  if (isExploding) {
    ship.explodeTime--;
  }

  //When the explode time reaches 1(not using zero here because that is the default for a ship),
  //make a new ship that is blinking
  if (ship.explodeTime == 1 && currentLives > 0){
    ship = newShip();
    ship.blinkTime = blinkDur * FPS;
    ship.blinking = true;
    currentLives--;
  }

  if(ship.blinkTime>0){
    ship.blinkTime--;
  }else {
    ship.blinking = false;
  }

  // asteroid/bullet collision checks
  for (var i = 0; i < lasers.length; i++) {
    for (var j = 0; j < asteroids.length; j++) {
      if (distanceBetweenPoints(lasers[i].x, lasers[i].y, asteroids[j].x, asteroids[j].y) < asteroids[j].radius * 1.25) {
        astExploding = true;
        astExp.x = asteroids[j].x;
        astExp.y = asteroids[j].y;
        astExp.r = asteroids[j].radius;
        astExp.dur = explodeDur * FPS;
        //Switch statement for determining how many points to add to score
        switch (asteroids[j].radius) {
          case ship.radius * 2:
            score += 100;
            break;
          case ship.radius:
            score += 75;
            break;
          case ship.radius/2:
            score += 50;
            break;
          default:
            break;
        }  
        astExplode(asteroids[j]);      
        lasers.splice(i, 1);
      }
    }
  }

  //draw asteroid explosion
  if (astExp.dur > 0) {
    
    drawExplode(astExp.x, astExp.y, astExp.r);
    console.log(astExp.x, astExp.y, astExp.r);
    astExp.dur--;
  }

  //updating high score
  if (score >= highScore || highScore == null){
    highScore = score;
    localStorage.highScore = score;
  }

  //Next level when all asteroids are destroyed
  

  if (asteroids.length == 0){
    nextLevel();
    tAlpha = 1;
  }


  clearCanvas();

  boundaryWarp();
  
  
  if(currentLives > 0){
    drawShip(isExploding, blink);
  }else{
    gameOver();
  }
  drawAsteroids();
  drawLasers();
  drawLives(last);
  drawHighScore();
  drawScore();
  displayLevel();
  tAlpha -= .01;
  //showBounds();
}
displayLevel();

//Event handlers for game controls DEPRECIATED
document.addEventListener('keydown', () => {
  switch (event.key) {
    case "ArrowUp":
      ship.thrusting = true;
      break;
    case "ArrowLeft":
      ship.rotation += turn_speed/FPS;
      break;
    case "ArrowRight":
      ship.rotation -= turn_speed/FPS;
      break;
    case " ":
      ship.firing = true;
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
    case " ":
      ship.firing = false;
      break;
    default:

  }
});

//debugging
function test(){
  //console.log('test');
}

function startGame(){
  setInterval(test, 1000);
  setInterval(update, 1000 / FPS); //Fps is 1/60th
  setInterval(createLasers, 1000 / rateOfFire);
}

function newGame(){
  numAsteroids = 3;
  level = 0;
  currentLives = 3;
  score = 0;
}

displayInstructions();
startButton.addEventListener('click', startGame);
startButton.addEventListener('click', () => {
  startButton.classList.add('hidden');
});
retryButton.addEventListener('click', newGame);
retryButton.addEventListener('click', () => {
  retryButton.classList.add('hidden');
});
startGame()