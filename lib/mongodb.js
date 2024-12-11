import mongoose from 'mongoose';

let isConnected = false; // Global cache to track connection state
let connectionPromise = null;

export async function connectMongoDB() {
  if (isConnected) {
    // If already connected, just return
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    await connectionPromise;
    isConnected = mongoose.connection.readyState === 1;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
