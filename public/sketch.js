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
  fill(data.r, data.g, data.b, 100);
  bird = new Bird(data.x, data.y);
  bird.display();

});

/* ----------------------------------- p5 ----------------------------------- */

let bg;
let musicNotes = ["♩", "♪", "♭", "♫", "♬", "♫"];
let notes = [];
let bird;

function preload() {
  // preload() loads the image before setup() runs
  bg = loadImage('links/background.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); // use degrees for easy angles

  let birdInfo = {
    x: random(width),
    y: random(height / 2 - 20, height / 2 + 20),
    r: random(30, 230),
    g: random(30, 230),
    b: random(30, 230),
  }

  //1
  socket.emit('data', birdInfo);
}

function draw() {
    background(bg);
    bird.display();

  // update and display active notes
  for (let i = notes.length - 1; i >= 0; i--) {
    let n = notes[i];
    n.display();
    n.move();

    // remove note once it floats too high
    if (n.alpha <= 0 || n.y < 0) {
      notes.splice(i, 1);
    }
  }

}

function mousePressed() {
  // create a note above bird’s head
  notes.push(new Note(bird.x, bird.y - 80));
}

/* --------------------------------- classes -------------------------------- */
//creating a template for bird
class Bird {

  //the setup function of an object class is a constructor
  constructor(x, y = 20) {
    this.x = x;
    this.y = y;
    this.r = random(30, 230);
    this.g = random(30, 230);
    this.b = random(30, 230);
    this.tail = random(130, 180);
  }

  //define the object's functionality
  display() {
    noStroke();
    fill(this.r, this.g, this.b, 100);
    //bird body
    arc(this.x, this.y, 150, 150, -60, 120, PIE);
    triangle(this.x + 23, this.y - 40, this.x + 45, this.y - 80, this.x + 105, this.y - 75);
    triangle(this.x - 36, this.y + 63, this.x - 95, this.y + this.tail, this.x - 50, this.y + this.tail);
    fill("rgb(255,255,255)");
    //bird eye
    ellipse(this.x + 50, this.y - 70, 7)
  }
}

//creating a template for music note
class Note {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 255;
    this.yv = random(-1.5, -2.5); // float upward speed
    this.xv = random(-0.3, 0.3);  // small sideways drift
    this.size = 24;
    this.symbol = random(musicNotes);
  }

  move() {
    this.x += this.xv;
    this.y += this.yv;
    this.alpha -= 2; // fade out
  }

  display() {
    fill(0, this.alpha);
    noStroke();
    textSize(this.size);
    text(this.symbol, this.x, this.y);
  }
}