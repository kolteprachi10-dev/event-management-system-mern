
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

// CHECK EVENT ACCESS
async function getEventAccess(eventId, userId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return null;
    }

    return Event.findOne({
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

// CHECK FINANCE PERMISSION
function canManageFinance(event, userId) {
    if (event.owner.toString() === userId.toString()) {
        return true;
    }

    return event.members.some(member =>
        member.user.toString() === userId.toString() &&
        member.status === "Accepted" &&
        member.role === "Finance Manager"
    );
}

// GET BUDGET AND EXPENSES
router.get("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied"
            });
        }

        const expenses = await Expense.find({
            event: event._id
        }).populate("createdBy", "name");

        const totalSpent = expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        const populatedEvent = await Event.findById(event._id)
            .populate("owner", "name email");

        res.status(200).json({
            budget: event.budget || 0,
            totalSpent,
            remaining: (event.budget || 0) - totalSpent,
            expenses,
            canManageFinance: canManageFinance(event, req.userId),
            event: populatedEvent
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE BUDGET
router.put("/:eventId/budget", authMiddleware, async (req, res) => {
    try {
        const { budget } = req.body;

        if (
            budget === undefined ||
            !Number.isFinite(Number(budget)) ||
            Number(budget) < 0
        ) {
            return res.status(400).json({
                message: "Enter a valid budget"
            });
        }

        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied"
            });
        }

        if (!canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Finance Manager can update the budget"
            });
        }

        event.budget = Number(budget);
        await event.save();

        res.json({
            message: "Budget updated successfully",
            budget: event.budget
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD EXPENSE
router.post("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied"
            });
        }

        if (!canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Finance Manager can add expenses"
            });
        }

        const {
            title,
            amount,
            category,
            description,
            date
        } = req.body;

        if (
            !title ||
            amount === undefined ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message: "Enter a title and a valid amount greater than zero"
            });
        }

        const expense = await Expense.create({
            title,
            amount: Number(amount),
            category,
            description,
            date,
            event: event._id,
            createdBy: req.userId
        });

        res.status(201).json({
            message: "Expense added successfully",
            expense
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE EXPENSE
router.put("/item/:expenseId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.expenseId)) {
            return res.status(400).json({ message: "Invalid expense ID" });
        }

        const expense = await Expense.findById(req.params.expenseId);

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        const event = await getEventAccess(expense.event, req.userId);

        if (!event) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Finance Manager can edit expenses"
            });
        }

        const {
            title,
            amount,
            category,
            description,
            date
        } = req.body;

        if (
            !title ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message: "Enter a valid title and amount"
            });
        }

        expense.title = title;
        expense.amount = Number(amount);
        expense.category = category;
        expense.description = description;
        expense.date = date;

        await expense.save();

        res.json({
            message: "Expense updated successfully",
            expense
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE EXPENSE
router.delete("/item/:expenseId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.expenseId)) {
            return res.status(400).json({ message: "Invalid expense ID" });
        }

        const expense = await Expense.findById(req.params.expenseId);

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        const event = await getEventAccess(expense.event, req.userId);

        if (!event) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Finance Manager can delete expenses"
            });
        }

        await expense.deleteOne();

        res.json({
            message: "Expense deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
