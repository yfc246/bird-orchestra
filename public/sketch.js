console.log('The app is working!');
let r;
let g;
let b;
let x;
let y;


/* -------------------------------------------------------------------------- */
/*                                 SOCKET CODE                                */
/* -------------------------------------------------------------------------- */
let socket = io();
// console.log(socket);


// (yafan/claude) variable to store assigned sound number & default audio state
// let audioStarted = false;
let pendingSoundNumber = null;

//4. socket on code
socket.on('connect', function () {
  console.log('Connected');
});

//(yafan/claude) listen for new client and play sound


//bird sound
socket.on('assign-sound', function (soundNumber) {
  console.log(`Assigned sound ${soundNumber}`);
  pendingSoundNumber = soundNumber; // Save for later

  // if (audioStarted) {
  //   playBirdSound(soundNumber);
  // }
  // playBirdSound(soundNumber); ❓pending gemini suggestion 

});

//(yafan/claude) receive message from server so that it plays sound to every client connected to server
socket.on('play-sound-all', function (data) {
  console.log(`Received play-sound-all for sound ${data.soundNumber}`);

  // Only play if this tab's audio has been unlocked by a click
  // if (audioStarted) {
  //   playBirdSound(soundNumber);
  // } else {
  //   console.log('Audio not started in this tab, blocking sound.');
  // }

  playBirdSound(data.soundNumber);

  // create note at the position sent from server
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      notes.push(new Note(data.birdX, data.birdY - 80));
    }, i * 500);
  }

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

/* ---------------- RECEIVE a socket message from the server ---------------- */

//receive a socket message from the server
let word = document.getElementById('container');


//listen for data and log data
socket.on('word-back', (data) => {
  console.log("Message arrived!");
  console.log(data);

  //Create a message string and page element
  let wordBack = data.word;
  let wordElement = document.createElement('h2');
  wordElement.innerHTML = wordBack;

  //Position element randomly on the page
  wordElement.style.position = 'absolute';
  wordElement.style.left = Math.random() * (90 - 40) + 40 + 'vw';
  wordElement.style.top = Math.random() * (20 - 5) + 5 + 'vh';
  wordElement.style.animation = 'fadeOut 5s forwards'; //fading animation

  //Add the element with the message to the page
  word.appendChild(wordElement);

});

/* ------------------ SEND a socket message to the Server ------------------ */

let wordInput = document.getElementById('wordInput');
let sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', function () {
  let NewWord = wordInput.value;

  let wordData = {
    word: NewWord,
  };

  //Send the message object to the server
  socket.emit('word', wordData);

  // Clear the input field after sending
  wordInput.value = '';
});

// Allow pressing Enter to send
wordInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendButton.click();
  }
});


/* -------------------------------------------------------------------------- */
/*                                   P5 CODE                                  */
/* -------------------------------------------------------------------------- */

let bg;
let musicNotes = ["♩", "♪", "♭", "♫", "♬", "♫"];
let notes = [];
let birds = []; // Array to store all birds from all clients
let myBird; // This client's bird
let birdSounds = [];//array to store bird sound files 
let time = 0; //for bezier curves (yafan)

function preload() {

  // preload() loads the image before setup() runs
  bg = loadImage('links/background.jpg');

  for (let i = 1; i <= 6; i++) {
    birdSounds[i] = loadSound(`links/bird_${i}.wav`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); // use degrees for easy angles

  // Generate random values for this client's bird
  let birdX = random(100, width / 2 - 10);
  let birdY = random(height / 2 - 50, height / 2 + 50);
  let birdR = random(30, 230);
  let birdG = random(30, 230);
  let birdB = random(30, 230);

  // Store my loco bird's position data 
  myBirdData = {
    x: birdX,
    y: birdY
  };

  // Send bird info to server
  let birdInfo = {
    x: birdX,
    y: birdY,
    r: birdR,
    g: birdG,
    b: birdB,
  }

  // Sending data back to server
  socket.emit('data', birdInfo);
}

function draw() {

  background(bg);

  // Increment time. You might want to make this smaller for a slower, calmer sine wave.
  time += 0.1;
  lines();

  // Display all birds
  for (let i = 0; i < birds.length; i++) {
    birds[i].display();
  }

  // Display a music notes
  for (let i = notes.length - 1; i >= 0; i--) {
    let n = notes[i];
    n.display();
    n.move();

    // note disappear
    if (n.alpha <= 0 || n.y < 0) {
      notes.splice(i, 1);
    }
  }
}

function mousePressed() {
  //enable audio
  // if (!audioStarted) {
  //   userStartAudio();
  //   audioStarted = true;
  //   console.log('Audio enabled!');
  // }

  // Emit to server instead of playing locally
  if (pendingSoundNumber && myBirdData) {

    socket.emit('play-sound', {
      soundNumber: pendingSoundNumber,

      //sending the location data of the bird
      birdX: myBirdData.x,
      birdY: myBirdData.y
    });
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
    arc(this.x, this.y, 150, 150, -60, 120, PIE); //bird body
    triangle(this.x + 23, this.y - 40, this.x + 45, this.y - 80, this.x + 105, this.y - 75); //bird head
    triangle(this.x - 36, this.y + 63, this.x - 95, this.y + this.tail, this.x - 50, this.y + this.tail); //bird tail
    //bird eye
    fill("rgba(247, 239, 233, 1)");
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function lines() {

  // Set the line style
  stroke(85, 80, 75, 100); // Dark brownish-gray
  strokeWeight(1.5);
  noFill();

  let amplitude = 100; // This controls the height of the wave

  // --- Line 1 ---
  // sin(time) gives a smooth value between -1 and 1.
  // We add a number inside the sin() to offset its phase (make it start at a different point in its wave)
  let wave1 = sin(time + 0) * amplitude;

  bezier(
    0, height * 0.46,           // Start point (x,y)
    width * 0.30, height * 0.3 + wave1, // Control 1 (animated)
    width * 0.65, height * 0.3 - wave1, // Control 2 (animated)
    width, height * 0.5           // End point (x,y)
  );

  // --- Line 2 ---
  // Using (time + 1.5) makes this wave flow differently from Line 1
  let wave2 = sin(time + 0.2) * amplitude;

  bezier(
    0, height * 0.5,           // Start point
    width * 0.33, height * 0.37 + wave2, // Control 1 (animated)
    width * 0.68, height * 0.37 - wave2, // Control 2 (animated)
    width, height * 0.55          // End point
  );

  // --- Line 3 ---
  let wave3 = sin(time + 0.1) * amplitude;

  bezier(
    0, height * 0.6,           // Start point
    width * 0.33, height * 0.44 + wave3, // Control 1
    width * 0.66, height * 0.44 - wave3, // Control 2
    width, height * 0.6          // End point
  );

  // --- Line 4 ---
  let wave4 = sin(time + 0.3) * amplitude;

  bezier(
    0, height * 0.65,           // Start point
    width * 0.28, height * 0.51 + wave4, // Control 1
    width * 0.70, height * 0.51 - wave4, // Control 2
    width, height * 0.66          // End point
  );

  // --- Line 5 ---
  let wave5 = sin(time + 0.5) * amplitude;

  bezier(
    0, height * 0.72,           // Start point
    width * 0.35, height * 0.58 + wave5, // Control 1
    width * 0.62, height * 0.58 - wave5, // Control 2
    width, height * 0.77          // End point
  );
}