import mongoose from "mongoose";
import { config } from 'dotenv';
config();

const mongoURI = process.env.MONGO_URI;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};


export default connectMongoDB;
