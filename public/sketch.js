console.log('The app is working!');
let r;
let g;
let b;
let x;
let y;
let size;

/* ------------------------------- SOCKET code ------------------------------ */
let socket = io();
// console.log(socket);

socket.on('connect', function () {
  console.log('Connected');
});

//4
socket.on('data-back', function (data) {
  console.log(data);
  noStroke();
  fill(data.r, data.g, data.b, 30);
  bird = new Bird(data.x, data.y);
  bird.display();
});

/* ----------------------------------- p5 ----------------------------------- */

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); // use degrees for easy angles
  background(255, 255, 255);

  let birdInfo = {
    x: random(width),
    y: random(height / 2, height / 2 + 10),
    r: random(255),
    g: random(255),
    b: random(255),
  }

  //1
  socket.emit('data', birdInfo);

}

function mouseClicked() {
}

//creating a template for salmon objects
class Bird {

  //the setup function of an object class is a constructor
  constructor(x, y = 20) {
    this.x = x;
    this.y = y;
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }

  //define the object's functionality
  display() {
    noStroke();
    fill(this.r, this.g, this.b);
    //bird body
    arc(this.x, this.y, 150, 150, -60, 120, PIE);
    triangle(this.x + 23, this.y - 40, this.x + 45, this.y - 80, this.x + 105, this.y - 75);
    triangle(this.x - 36, this.y + 63, this.x - 95, this.y + 150, this.x - 50, this.y + 150);
    fill("rgb(255,255,255)");
    //bird eye
    ellipse(this.x + 50, this.y - 70, 7)
  }


}