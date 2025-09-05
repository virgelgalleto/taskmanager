import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://24virgel:8hCH2GmSp08fJhm9@taskmanager.sqpitl1.mongodb.net/?retryWrites=true&w=majority&appName=taskmanager";
  mongoose.set("strictQuery", false);
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}