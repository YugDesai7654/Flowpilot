import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URL;

async function dbConnect(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGO_URL environment variable');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export default dbConnect;

