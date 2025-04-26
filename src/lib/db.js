import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function connectWithRetry(retryCount = 0) {
	const opts = {
		bufferCommands: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	};

	try {
		const connection = await mongoose.connect(MONGODB_URI, opts);
		console.log("Successfully connected to MongoDB.");
		return connection;
	} catch (error) {
		if (retryCount < MAX_RETRIES) {
			console.log(
				`Connection attempt ${retryCount + 1} failed. Retrying in ${
					RETRY_DELAY / 1000
				} seconds...`
			);
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
			return connectWithRetry(retryCount + 1);
		}
		console.error(
			"Failed to connect to MongoDB after multiple attempts:",
			error
		);
		throw error;
	}
}

export async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		try {
			cached.promise = connectWithRetry();
			cached.conn = await cached.promise;
			return cached.conn;
		} catch (error) {
			console.error("MongoDB connection error:", error);
			throw error;
		}
	}

	try {
		cached.conn = await cached.promise;
		return cached.conn;
	} catch (error) {
		console.error("Error resolving MongoDB connection:", error);
		throw error;
	}
}
