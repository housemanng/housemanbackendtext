import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = (process.env.MONGODB_URI || process.env.MONGO_URI) as string;

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('Missing MongoDB connection string. Set MONGODB_URI or MONGO_URI.');
    }
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Atlas Connected Successfully");


  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
