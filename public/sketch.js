console.log('The app is working!');
let r;
let g;
let b;
let size;

/*SOCKET code */
let socket = io();
// console.log(socket);

socket.on('connect', function(){
  console.log('Connected');
});

//4
socket.on('data-back', function(data){
  console.log(data);
  noStroke();
  fill(data.r, data.g, data.b, 20);
  // ellipse(data.x, data.y, data.size);

  // text('hola', data.x, data.y)

  //added data from user input
  text(data.text, data.x, data.y);
  textSize(50);
});

/*p5 */
function setup(){
  createCanvas(windowWidth, windowHeight);
  r = random(255);
  g = random(255);
  b = random(255);
  size = random(20, 50);
}

function mouseMoved(){

  // ellipse(mouseX, mouseY, 30);

  //variable for user text data (google gemini)
  let userText = document.getElementById('myText').value;

  let ellipseInfo = {
    x: mouseX,
    y: mouseY,
    r: r,
    g: g,
    b: b,
    size: size,
    text: userText
  }

  //1
  socket.emit('data', ellipseInfo);
}
