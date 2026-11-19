
const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1. CREATE EVENT
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { title, description, eventType, date, location } = req.body;

        if (!title || !eventType || !date) {
            return res.status(400).json({
                message: "Title, event type and date are required"
            });
        }

        const event = new Event({
            title,
            description,
            eventType,
            date,
            location,
            owner: req.userId
        });

        await event.save();

        res.status(201).json({
            message: "Event created successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 2. GET ALL OWN EVENTS
router.get("/my-events", authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({
            owner: req.userId
        });

        res.status(200).json({
            message: "Events fetched successfully",
            events
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 3. GET SINGLE EVENT (OWNER OR ACCEPTED MEMBER)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findOne({
            _id: id,
            $or: [
                { owner: req.userId },
                {
                    members: {
                        $elemMatch: {
                            user: new mongoose.Types.ObjectId(req.userId),
                            status: "Accepted"
                        }
                    }
                }
            ]
        })
        .populate("owner", "name email")
        .populate("members.user", "name email");

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you don't have access"
            });
        }

        res.status(200).json({
            message: "Event fetched successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 4. UPDATE EVENT (OWNER ONLY)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, eventType, date, location } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findOne({
            _id: id,
            owner: req.userId
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (title !== undefined) event.title = title;
        if (description !== undefined) event.description = description;
        if (eventType !== undefined) event.eventType = eventType;
        if (date !== undefined) event.date = date;
        if (location !== undefined) event.location = location;

        await event.save();

        res.status(200).json({
            message: "Event updated successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 5. DELETE EVENT (OWNER ONLY)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findOneAndDelete({
            _id: id,
            owner: req.userId
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
