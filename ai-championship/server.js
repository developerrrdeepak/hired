const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create-room', (roomId) => {
      socket.join(roomId);
      rooms.set(roomId, { host: socket.id, participants: [socket.id] });
      socket.emit('room-created', roomId);
    });

    socket.on('join-room', (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        socket.join(roomId);
        room.participants.push(socket.id);
        socket.to(roomId).emit('user-joined', socket.id);
        socket.emit('room-joined', roomId);
      } else {
        socket.emit('error', 'Room not found');
      }
    });

    socket.on('offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('offer', { offer, from: socket.id });
    });

    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', { answer, from: socket.id });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      rooms.forEach((room, roomId) => {
        if (room.participants.includes(socket.id)) {
          room.participants = room.participants.filter(id => id !== socket.id);
          socket.to(roomId).emit('user-left', socket.id);
          if (room.participants.length === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
