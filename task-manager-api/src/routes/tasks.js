import { Router } from "express";
import Task from "../models/Task.js";

const router = Router();

// CREATE
router.post("/", async (req, res, next) => {
  try {
    const { title, description = "", status } = req.body;
    const task = await Task.create({ title, description, status });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// READ (list) with search & status filter
// GET /tasks?q=keyword&status=pending|in-progress|completed
router.get("/", async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const filter = {};

    if (status && ["pending", "in-progress", "completed"].includes(status)) {
      filter.status = status;
    }

    if (q && q.trim()) {
      // Regex search on title OR description (case-insensitive)
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") }
      ];
      // If you prefer text search (requires index above):
      // filter.$text = { $search: q };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// READ (single)
router.get("/:id", async (req, res, next) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

// UPDATE (full)
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const t = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    );
    if (!t) return res.status(404).json({ error: "Task not found" });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

// UPDATE status only
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const t = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!t) return res.status(404).json({ error: "Task not found" });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const t = await Task.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Deleted", id: t._id });
  } catch (err) {
    next(err);
  }
});

export default router;
