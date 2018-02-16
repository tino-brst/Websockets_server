var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, () => {
	console.log('Websockets server listening on port 4000');
})

// Archivos para pagina con log de eventos
app.use(express.static('public'));

// Socket.io

var io = socket(server);

io.on('connection', (socket) => {
	console.log('new connection! - ' + socket.id);
	socket.on('new message', (data) => {
		console.log(data.message);
		socket.broadcast.emit('new message', data);
	})
})