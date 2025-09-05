import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./db.js";
import tasksRouter from "./routes/tasks.js";

const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_, res) => res.json({ ok: true, name: "Task Manager API" }));
app.use("/tasks", tasksRouter);

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));
// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
});
