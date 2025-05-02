const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare to start the Next.js app
app.prepare().then(() => {
	// Create a custom HTTP server
	const server = createServer((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	// Initialize Socket.io with the server
	const io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	// Store active users and their room subscriptions
	const activeUsers = new Map();

	// Socket.io connection handling
	io.on("connection", (socket) => {
		console.log("A user connected:", socket.id);

		// Handle room joining
		socket.on("join_room", (roomId) => {
			console.log(`User ${socket.id} joined room: ${roomId}`);
			socket.join(roomId);
		});

		// Handle message sending
		socket.on("send_message", (data) => {
			console.log(`Message in room ${data.roomId}: ${data.content}`);
			// Broadcast the message to all users in the room except the sender
			socket.to(data.roomId).emit("receive_message", data);
		});

		// Handle typing indicator
		socket.on("typing", (data) => {
			console.log(`User ${data.userId} is typing in room ${data.roomId}`);
			socket.to(data.roomId).emit("user_typing", data);
		});

		// Handle disconnection
		socket.on("disconnect", () => {
			console.log("User disconnected:", socket.id);
			activeUsers.delete(socket.id);
		});
	});

	// Setup graceful shutdown
	const gracefulShutdown = () => {
		console.log("Received kill signal, shutting down gracefully");
		server.close(() => {
			console.log("Closed out remaining connections");
			process.exit(0);
		});

		// Force close if taking too long
		setTimeout(() => {
			console.error(
				"Could not close connections in time, forcefully shutting down"
			);
			process.exit(1);
		}, 10000);
	};

	// Listen for TERM signal (e.g. kill command)
	process.on("SIGTERM", gracefulShutdown);
	// Listen for INT signal (e.g. Ctrl+C)
	process.on("SIGINT", gracefulShutdown);

	// Start the server
	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
