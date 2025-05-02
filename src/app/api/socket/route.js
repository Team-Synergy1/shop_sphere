import { NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";

let io;

export async function GET(req) {
	const res = NextResponse.json({
		success: true,
		message: "Socket server running",
	});

	if (!io) {
		
		const httpServer = res.socket?.server;

		if (httpServer) {
			io = new SocketIOServer(httpServer, {
				path: "/api/socket/io",
				addTrailingSlash: false,
			});

		
			const activeUsers = new Map();


			io.on("connection", (socket) => {
				console.log("A user connected:", socket.id);

		
				socket.on("join_room", (roomId) => {
					console.log(`User ${socket.id} joined room: ${roomId}`);
					socket.join(roomId);
				});

				socket.on("send_message", (data) => {
					console.log(`Message in room ${data.roomId}: ${data.content}`);
					
					socket.to(data.roomId).emit("receive_message", data);
				});

	
				socket.on("typing", (data) => {
					console.log(`User ${data.userId} is typing in room ${data.roomId}`);
					socket.to(data.roomId).emit("user_typing", data);
				});

			
				socket.on("disconnect", () => {
					console.log("User disconnected:", socket.id);
					activeUsers.delete(socket.id);
				});
			});

			console.log("Socket.io server initialized");
		}
	}

	return res;
}
