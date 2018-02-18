// var socket = io.connect('http://localhost:4000');

var app = new Vue({
	el: '#app',
	data: {
		messages: [],
		newMessage: '',
		socket: io.connect('http://localhost:4000')
	},
	created() {
		this.socket.on('new message', (data) => {
			this.messages.push({
				content: data.message,
				isMine: false
			});
		});

		this.socket.emit('register', {
			screenId: 123,
			room: 'screens'
		})

	},
	methods: {
		send() {
			this.socket.emit('new message', {
				message: this.newMessage
			}),

			this.messages.push({
				content: this.newMessage,
				isMine: true
			});

			this.newMessage = '';
		}
	}
});