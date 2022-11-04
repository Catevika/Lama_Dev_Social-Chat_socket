const io = require('socket.io')(8900, {
	cors: {
		origin: 'http://localhost:3000'
	}
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({ userId, socketId });
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
	// CONNECT
	console.log('new user connected!');

	// RECEIVE USERID FROM SOCKET-CLIENT
	socket.on('addUser', (userId) => {
		addUser(userId, socket.id);
		io.emit('getUsers', users);
	});

	// SEND AND GET MESSAGE
	socket.on('sendMessage', ({ senderId, receiverId, text }) => {
		const receiver = getUser(receiverId);
		io.to(receiver.socketId).emit('getMessage', {
			senderId,
			text
		});
	});

	socket.on('disconnect', () => {
		// DISCONNECT - YES, disconnection is inside connection !!
		console.log('A user disconnected!');
		removeUser(socket.id);
		io.emit('getUsers', users);
	});
});
