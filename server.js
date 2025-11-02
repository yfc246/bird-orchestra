let express = require('express');
let app = express();

//Serve public files
app.use(express.static('public'));

//HTTP server
let http = require('http');
let server = http.createServer(app);

//Start the server
let port = 3000;
server.listen(port, function(){
  console.log(`The port is listening at localhost:${port}`);
});

/*SOCKET CODE server side socket connection*/
const { Server } = require('socket.io');
const io = new Server(server);

//(yafan) variable for assigning sound to specific client 
let clientCount = 0;

//Establish socket connection
io.on('connection', function(socket){
  console.log(`Socket connected with id: ${socket.id}`);

  //2 server side on event

  //(yafan/claude) assign & send sound files, if client exceeds 8, loop to the first and repeat ()
  let soundNumber = (clientCount % 8) + 1;
  clientCount++;
  socket.emit('assign-sound', soundNumber);

  socket.on('data', function(data){
    console.log(data);
    //3 server side emit (sending data back to client)
    io.emit('data-back', data);
  });

  //(yafan) added so that sound is broadcasted to all clients connected to the server
    socket.on('play-sound', function(soundNumber){
    console.log(`Playing sound ${soundNumber} for all clients`);
    io.emit('play-sound-all', soundNumber);
  });

  //the rest of the server socket code
  socket.on('disconnect', function(){
    console.log(`A client disconnected: ${socket.id}`);
  });
});
