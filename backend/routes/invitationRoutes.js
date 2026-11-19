
const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// 1. INVITE USER TO EVENT
router.post("/:eventId/invite", authMiddleware, async (req, res) => {
    try {
        const { email, role } = req.body;
        const { eventId } = req.params;

        const allowedRoles = [
            "Task Manager",
            "Finance Manager",
            "Guest Manager",
            "Vendor Manager",
            "Viewer"
        ];

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const event = await Event.findOne({
            _id: eventId,
            owner: req.userId
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you are not the owner"
            });
        }

        const invitedUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!invitedUser) {
            return res.status(404).json({
                message: "User not found. They must register first."
            });
        }

        if (invitedUser._id.toString() === req.userId) {
            return res.status(400).json({
                message: "You cannot invite yourself"
            });
        }

        const alreadyInvited = event.members.some(
            member => member.user.toString() === invitedUser._id.toString()
        );

        if (alreadyInvited) {
            return res.status(400).json({
                message: "User has already been invited"
            });
        }

        event.members.push({
            user: invitedUser._id,
            role: role || "Viewer",
            status: "Pending"
        });

        await event.save();

        res.status(201).json({
            message: "Invitation sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 2. ACCEPT OR REJECT INVITATION
router.put("/:eventId/respond", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { eventId } = req.params;

        if (!["Accepted", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid invitation response"
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const member = event.members.find(
            member => member.user.toString() === req.userId
        );

        if (!member) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        if (member.status !== "Pending") {
            return res.status(400).json({
                message: "Invitation has already been answered"
            });
        }

        member.status = status;

        await event.save();

        res.status(200).json({
            message: `Invitation ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 3. GET MY PENDING INVITATIONS
router.get("/my-invitations", authMiddleware, async (req, res) => {
    try {
        const invitations = await Event.find({
            members: {
                $elemMatch: {
                    user: req.userId,
                    status: "Pending"
                }
            }
        })
        .populate("owner", "name email")
        .populate("members.user", "name email");

        res.status(200).json({
            count: invitations.length,
            invitations
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 4. GET MY ACCEPTED SHARED EVENTS
router.get("/shared-events", authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({
            members: {
                $elemMatch: {
                    user: req.userId,
                    status: "Accepted"
                }
            }
        })
        .populate("owner", "name email")
        .populate("members.user", "name email");

        res.status(200).json({
            count: events.length,
            events
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
