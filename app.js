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

// Pantallas esperando setup y ya en linea
var screensWaitingSetup = [];
var screensOnline = [];

io.on('connection', (socket) => {

	console.log('+ id: ' + socket.id);

	// Pantalla se agrega a lista de pantallas en linea
	socket.on('screenConnected', (udid) => {
		// Agrego pantalla a las pantallas en linea
		screensOnline.push({
			udid: udid,
			socketId: socket.id
		})
	})

	// Inicio del modo "esperando setup" de una pantalla
	socket.on('screenSetup', (udid, callback) => {
		var pin = generatePin();
		// agrego a las pantallas en espera de setup
		screensWaitingSetup.push({
			udid: udid,
			pin: pin, // genero pin
			socketId: socket.id
		});
		// mando pin generado a la pantalla
		callback(pin);
	})

	// Obtencion de UDID a partir de un pin en pantalla
	socket.on('screenUdid', (pin, callback) => {
		var screen = screensWaitingSetup.find((screen) => { return screen.pin === pin });
		var udid = (screen) ? screen.udid : null;
		callback(udid);
	})

	// Anuncio que se agrego una pantalla al sistema
	socket.on('screenAdded', (udid) => {
		var screen = screensWaitingSetup.find((screen) => { return screen.udid === udid });
		if (screen) {
			// envio a la pantalla aviso de update
			io.to(screen.socketId).emit('updateScreen');
			// elimino la pantalla de la lista esperando setup
			var index = screensWaitingSetup.findIndex((screen) => { return screen.udid === udid});
			screensWaitingSetup.splice(index, 1);
		}
	})

	// Anuncio cambio en el contenido de una pantalla
	socket.on('screenUpdated', (udid) => {
		var screen = screensOnline.find((screen) => { return screen.udid === udid });
		if (screen) {
			// envio a la pantalla aviso de update
			io.to(screen.socketId).emit('updateScreen');
		}
	})

	// Anuncio cambio en el contenido de una pantalla
	socket.on('screenDeleted', (udid) => {
		var screen = screensOnline.find((screen) => { return screen.udid === udid });
		if (screen) {
			// envio a la pantalla aviso de update
			io.to(screen.socketId).emit('updateScreen');
		}
	})

	// En desconeccion, elimino a la pantalla de las listas en las que se haya agregado
	socket.on('disconnect', () => {
		console.log('- id: ' + socket.id);
		// lista esperando setup
		var index = screensWaitingSetup.findIndex((screen) => { return screen.socketId === socket.id });
		if (index >= 0) {
			screensWaitingSetup.splice(index, 1); 
		}
		// lista de pantallas online
		index = screensOnline.findIndex((screen) => { return screen.socketId === socket.id });
		if (index >= 0) {
			screensOnline.splice(index, 1); 
		}
	}) 
})


// Generacion de pines para mostrar en pantalla durante setup
function generatePin() {
  var pin = "";
  var length = 4
  var possible = "0123456789";
  // var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (var i = 0; i < length; i++)
    pin += possible.charAt(Math.floor(Math.random() * possible.length));

  return pin;
}