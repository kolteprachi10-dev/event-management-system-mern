
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/Task");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

// Check event access
async function getEventAccess(eventId, userId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return null;
    }

    return await Event.findOne({
        _id: eventId,
        $or: [
            { owner: userId },
            {
                members: {
                    $elemMatch: {
                        user: userId,
                        status: "Accepted"
                    }
                }
            }
        ]
    });
}

// Check task management permission
function canManageTasks(event, userId) {
    if (event.owner.toString() === userId.toString()) {
        return true;
    }

    const member = event.members.find(item =>
        item.user.toString() === userId.toString() &&
        item.status === "Accepted"
    );

    return member && member.role === "Task Manager";
}

// 1. CREATE TASK
router.post("/create/:eventId", authMiddleware, async (req, res) => {
    try {
        const { title, description, dueDate, priority, status } = req.body;

        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you do not have access"
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        if (!canManageTasks(event, req.userId)) {
            return res.status(403).json({
                message: "You do not have permission to create tasks"
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description,
            dueDate,
            priority,
            status,
            event: event._id,
            createdBy: req.userId
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. GET ALL TASKS FOR AN EVENT
router.get("/event/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you do not have access"
            });
        }

        const tasks = await Task.find({ event: event._id })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. GET TASK BY ID
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const event = await getEventAccess(task.event.toString(), req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you do not have access"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. UPDATE TASK
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const event = await getEventAccess(task.event.toString(), req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you do not have access"
            });
        }

        const isCreator =
            task.createdBy.toString() === req.userId.toString();

        if (!canManageTasks(event, req.userId) && !isCreator) {
            return res.status(403).json({
                message: "You do not have permission to update this task"
            });
        }

        const { title, description, dueDate, priority, status } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (priority !== undefined) task.priority = priority;
        if (status !== undefined) task.status = status;

        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. DELETE TASK
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const event = await getEventAccess(task.event.toString(), req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you do not have access"
            });
        }

        const isCreator =
            task.createdBy.toString() === req.userId.toString();

        if (!canManageTasks(event, req.userId) && !isCreator) {
            return res.status(403).json({
                message: "You do not have permission to delete this task"
            });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
