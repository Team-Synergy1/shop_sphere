import { NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';

// Socket.io instance
let io;

export async function GET(req) {
  const res = NextResponse.json({ success: true, message: 'Socket server running' });
  
  if (!io) {
    // Access the raw Node.js server from the response object
    const httpServer = res.socket?.server;
    
    if (httpServer) {
      io = new SocketIOServer(httpServer, {
        path: '/api/socket/io',
        addTrailingSlash: false,
      });

      // Store active users and their room subscriptions
      const activeUsers = new Map();

      // Socket.io connection handling
      io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle room joining
        socket.on('join_room', (roomId) => {
          console.log(`User ${socket.id} joined room: ${roomId}`);
          socket.join(roomId);
        });

        // Handle message sending
        socket.on('send_message', (data) => {
          console.log(`Message in room ${data.roomId}: ${data.content}`);
          // Broadcast the message to all users in the room except the sender
          socket.to(data.roomId).emit('receive_message', data);
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
          console.log(`User ${data.userId} is typing in room ${data.roomId}`);
          socket.to(data.roomId).emit('user_typing', data);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
          activeUsers.delete(socket.id);
        });
      });
      
      console.log('Socket.io server initialized');
    }
  }
  
  return res;
}