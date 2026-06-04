import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;
