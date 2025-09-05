import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      index: true
    }
  },
  { timestamps: true } // adds createdAt & updatedAt
);

// Optional: supports text search via $text (we’ll use regex in routes for simplicity)
TaskSchema.index({ title: "text", description: "text" });

export default mongoose.model("Task", TaskSchema);
