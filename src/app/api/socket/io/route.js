// src/app/api/socket/io/route.js
import { Server as SocketIOServer } from "socket.io";
import { NextResponse } from "next/server";

// Set up a global variable to store the Socket.io instance
let io;

export async function GET(req) {
	if (!io) {
		// Create a new Socket.io server if one doesn't exist
		io = new SocketIOServer({
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		// Socket.io connection handling
		io.on("connection", (socket) => {
			console.log("A user connected:", socket.id);

			// Handle room joining
			socket.on("join_room", (roomId) => {
				socket.join(roomId);
			});

			// Handle message sending
			socket.on("send_message", (data) => {
				// Broadcast the message to all users in the room except the sender
				socket.to(data.roomId).emit("receive_message", data);
			});

			// Handle typing indicator
			socket.on("typing", (data) => {
				socket.to(data.roomId).emit("user_typing", data);
			});

			// Handle disconnection
			socket.on("disconnect", () => {
				console.log("User disconnected:", socket.id);
			});
		});
	}

	// Return a 200 response to acknowledge the connection
	return new NextResponse("Socket.io server is running", { status: 200 });
}
