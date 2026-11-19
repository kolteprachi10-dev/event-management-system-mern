
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Guest = require("../models/Guest");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

const getEventAccess = async (eventId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return null;
    }

    const event = await Event.findById(eventId);

    if (!event) {
        return null;
    }

    const isOwner = event.owner.toString() === userId.toString();

    const isAcceptedMember = event.members?.some(member =>
        member.user.toString() === userId.toString() &&
        member.status === "Accepted"
    );

    if (!isOwner && !isAcceptedMember) {
        return null;
    }

    return event;
};

const canManageGuests = (event, userId) => {
    const isOwner = event.owner.toString() === userId.toString();

    const isGuestManager = event.members?.some(member =>
        member.user.toString() === userId.toString() &&
        member.status === "Accepted" &&
        member.role === "Guest Manager"
    );

    return isOwner || isGuestManager;
};

// GET all guests and statistics
router.get("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied."
            });
        }

        const guests = await Guest.find({
            event: event._id
        })
        .populate("createdBy", "name")
        .sort({ createdAt: -1 });

        const totalGuests = guests.length;
        const accepted = guests.filter(g => g.rsvpStatus === "Accepted").length;
        const declined = guests.filter(g => g.rsvpStatus === "Declined").length;
        const pending = guests.filter(g => g.rsvpStatus === "Pending").length;
        const invitationsSent = guests.filter(
            g => g.invitationStatus === "Sent"
        ).length;

        res.json({
            guests,
            totalGuests,
            accepted,
            declined,
            pending,
            invitationsSent,
            canManageGuests: canManageGuests(event, req.userId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD guest
router.post("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied."
            });
        }

        if (!canManageGuests(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Guest Manager can manage guests."
            });
        }

        const { name, email, phone, invitationStatus, rsvpStatus } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Guest name is required."
            });
        }

        const guest = await Guest.create({
            name,
            email,
            phone,
            invitationStatus: invitationStatus || "Not Sent",
            rsvpStatus: rsvpStatus || "Pending",
            event: event._id,
            createdBy: req.userId
        });

        res.status(201).json({
            message: "Guest added successfully.",
            guest
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE guest
router.put("/item/:guestId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.guestId)) {
            return res.status(400).json({ message: "Invalid guest ID." });
        }

        const guest = await Guest.findById(req.params.guestId);

        if (!guest) {
            return res.status(404).json({ message: "Guest not found." });
        }

        const event = await getEventAccess(guest.event, req.userId);

        if (!event || !canManageGuests(event, req.userId)) {
            return res.status(403).json({
                message: "You are not allowed to update this guest."
            });
        }

        const name = req.body.name ?? guest.name;

        if (!name.trim()) {
            return res.status(400).json({
                message: "Guest name is required."
            });
        }

        guest.name = name;
        guest.email = req.body.email ?? guest.email;
        guest.phone = req.body.phone ?? guest.phone;

        if (req.body.invitationStatus !== undefined) {
            guest.invitationStatus = req.body.invitationStatus;
        }

        if (req.body.rsvpStatus !== undefined) {
            guest.rsvpStatus = req.body.rsvpStatus;
        }

        await guest.save();

        res.json({
            message: "Guest updated successfully.",
            guest
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE guest
router.delete("/item/:guestId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.guestId)) {
            return res.status(400).json({ message: "Invalid guest ID." });
        }

        const guest = await Guest.findById(req.params.guestId);

        if (!guest) {
            return res.status(404).json({ message: "Guest not found." });
        }

        const event = await getEventAccess(guest.event, req.userId);

        if (!event || !canManageGuests(event, req.userId)) {
            return res.status(403).json({
                message: "You are not allowed to delete this guest."
            });
        }

        await guest.deleteOne();

        res.json({ message: "Guest deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
