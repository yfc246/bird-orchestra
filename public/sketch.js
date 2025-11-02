console.log('The app is working!');
let r;
let g;
let b;
let x;
let y;

/* ------------------------------- SOCKET code ------------------------------ */
let socket = io();
// console.log(socket);


// (yafan/claude) variable to store assigned sound number & default audio state
let audioStarted = false;
let pendingSoundNumber = null;

//4. socket on code
socket.on('connect', function () {
  console.log('Connected');
});

//(yafan/claude) listen for new client and play sound


//bird sound
socket.on('assign-sound', function(soundNumber) {
  console.log(`Assigned sound ${soundNumber}`);
  pendingSoundNumber = soundNumber; // Save for later
  
  // if (audioStarted) {
  //   playBirdSound(soundNumber);
  // }
  playBirdSound(soundNumber);

});

//(yafan/claude) receive message from server so that it plays sound to every client connected to server
socket.on('play-sound-all', function(soundNumber) {
  console.log(`Received play-sound-all for sound ${soundNumber}`); 

  // if (audioStarted) {
  //   playBirdSound(soundNumber);
  // }

    playBirdSound(soundNumber);

});

function playBirdSound(soundNumber) {
  
 if (birdSounds[soundNumber]) {
    birdSounds[soundNumber].play();
    console.log(`Playing preloaded sound ${soundNumber}`);
  }
}

//bird graphic
socket.on('data-back', function (data) {
  console.log(data);
  // Create a new bird and add it to the birds array
  let newBird = new Bird(data.x, data.y, data.r, data.g, data.b);
  birds.push(newBird);
});

/* ----------------------------------- p5 ----------------------------------- */

let bg;
let musicNotes = ["♩", "♪", "♭", "♫", "♬", "♫"];
let notes = [];
let birds = []; // Array to store all birds from all clients
let myBird; // This client's bird
let birdSounds = [];//array to store bird sound files 

function preload() {
  // preload() loads the image before setup() runs
  bg = loadImage('links/background.jpg');

  for (let i = 1; i <= 8; i++) {
    birdSounds[i] = loadSound(`links/bird_${i}.wav`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); // use degrees for easy angles

  // Generate random values for this client's bird
  let birdX = random(width);
  let birdY = random(height / 2 - 20, height / 2 + 20);
  let birdR = random(30, 230);
  let birdG = random(30, 230);
  let birdB = random(30, 230);

  // Create this client's bird
  myBird = new Bird(birdX, birdY, birdR, birdG, birdB);
  birds.push(myBird); // Add to birds array

  // Send bird info to server (including tail position)
  let birdInfo = {
    x: birdX,
    y: birdY,
    r: birdR,
    g: birdG,
    b: birdB,
  }

  //1
  socket.emit('data', birdInfo);
}

function draw() {
  background(bg);

  // Display all birds
  for (let i = 0; i < birds.length; i++) {
    birds[i].display();
  }

  // Display a music notes
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
  //enable audio
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
    console.log('Audio enabled!');
  }

  console.log(`Emitting sound ${pendingSoundNumber}, audioStarted: ${audioStarted}`);
  
  // Emit to server instead of playing locally
  if (pendingSoundNumber) {
    socket.emit('play-sound', pendingSoundNumber);
  }
  
  // Create a note above bird's head
  if (myBird) {
    notes.push(new Note(myBird.x, myBird.y - 80));
  }
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
    this.alpha = 100;
    this.yv = random(-1.5, -2.5); // float upward speed
    this.xv = random(-0.3, 0.3);  // small sideways drift
    this.size = 24;
    this.symbol = random(musicNotes);
  }

  move() {
    this.x += this.xv;
    this.y += this.yv;
    this.alpha -= 1; // fade out
  }

  display() {
    fill(0, this.alpha);
    noStroke();
    textSize(this.size);
    text(this.symbol, this.x, this.y);
  }
}