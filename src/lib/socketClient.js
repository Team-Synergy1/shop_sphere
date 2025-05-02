import { io } from 'socket.io-client';

// Create a singleton instance of the socket connection
let socket;

export const initializeSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    socket = io(socketUrl, {
      path: '/api/socket/io',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const joinChatRoom = (roomId) => {
  const socket = getSocket();
  socket.emit('join_room', roomId);
};

export const sendMessage = (roomId, messageData) => {
  const socket = getSocket();
  socket.emit('send_message', {
    roomId,
    ...messageData
  });
};

export const listenForMessages = (callback) => {
  const socket = getSocket();
  socket.on('receive_message', (data) => {
    callback(data);
  });
  
  return () => {
    socket.off('receive_message');
  };
};

export const indicateTyping = (roomId, userData) => {
  const socket = getSocket();
  socket.emit('typing', {
    roomId,
    ...userData
  });
};

export const listenForTyping = (callback) => {
  const socket = getSocket();
  socket.on('user_typing', (data) => {
    callback(data);
  });
  
  return () => {
    socket.off('user_typing');
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};