
const express = require("express");
const router = express.Router();
const Task = require("../models/file");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new task
router.post("/", async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();

    if (!title) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const task = await Task.create({ title });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update a task
router.put("/:id", async (req, res) => {
  try {
    const updates = {};

    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();

      if (!title) {
        return res.status(400).json({
          message: "Task title is required"
        });
      }

      updates.title = title;
    }

    if (req.body.completed !== undefined) {
      if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be true or false"
        });
      }

      updates.completed = req.body.completed;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
