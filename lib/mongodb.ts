import mongoose from 'mongoose';

export {};

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const opts: mongoose.ConnectOptions = {
  bufferCommands: false,
};

// Initialize global mongoose object
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export async function connectMongoDB() {
  if (global.mongoose.conn) {
    // If a connection is already established, return it
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    // If connection promise is not already set, create one
    global.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((error) => {
        // Reset on failure
        global.mongoose.promise = null;
        throw error;
      });
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
    console.log("MongoDB connected");
    return global.mongoose.conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
