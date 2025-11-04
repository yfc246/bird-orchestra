let express = require('express');
let app = express();

//Serve public files
app.use(express.static('public'));

//HTTP server
let http = require('http');
let server = http.createServer(app);

//Start the server
let port = 3000;
server.listen(port, function () {
  console.log(`The port is listening at localhost:${port}`);
});

/* -------------------------------------------------------------------------- */
/*                  SOCKET CODE server side socket connection                 */
/* -------------------------------------------------------------------------- */
const { Server } = require('socket.io');
const io = new Server(server);

//(yafan) variable for assigning sound to specific client 
let clientCount = 0;

//Establish socket connection
io.on('connection', function (socket) {
  console.log(`Socket connected with id: ${socket.id}`);

  //2 server side on event

  //(yafan/claude) assign & send sound files, if client exceeds 6, loop to the first and repeat ()
  let soundNumber = (clientCount % 6) + 1;
  clientCount++;
  socket.emit('assign-sound', soundNumber);

  /* -------------------- Sending BIRD data bact to client -------------------- */
  socket.on('data', function (data) {
    console.log(data);
    //3 server side emit (sending data back to client)
    io.emit('data-back', data);
  });

  /* ----------- Sending BIRD SOUND & MUSIC NOTE data back to client ---------- */
  socket.on('play-sound', function (data) {
    console.log(`Playing sound ${data.soundNumber} for clients at position (${data.birdX}, ${data.birdY})`);
    io.emit('play-sound-all', {
      soundNumber: data.soundNumber,
      birdX: data.birdX,
      birdY: data.birdY
    });
  });

});
