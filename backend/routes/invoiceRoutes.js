
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Invoice = require("../models/Invoice");
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

const canManageFinance = (event, userId) => {
    const isOwner = event.owner.toString() === userId.toString();

    const isFinanceManager = event.members?.some(member =>
        member.user.toString() === userId.toString() &&
        member.status === "Accepted" &&
        member.role === "Finance Manager"
    );

    return isOwner || isFinanceManager;
};

const getStatus = (amount, amountPaid) => {
    if (amountPaid === 0) return "Pending";
    if (amountPaid >= amount) return "Paid";
    return "Partially Paid";
};

// GET all invoices for an event
router.get("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied."
            });
        }

        const invoices = await Invoice.find({
            event: event._id
        })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

        const totalAmount = invoices.reduce(
            (sum, invoice) => sum + invoice.amount, 0
        );

        const totalPaid = invoices.reduce(
            (sum, invoice) => sum + invoice.amountPaid, 0
        );

        res.json({
            invoices,
            totalAmount,
            totalPaid,
            remainingAmount: totalAmount - totalPaid,
            canManageFinance: canManageFinance(event, req.userId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE invoice
router.post("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied."
            });
        }

        if (!canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Finance Manager can manage invoices."
            });
        }

        const { title, amount, amountPaid, dueDate, description } = req.body;

        if (!title || amount === undefined || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Enter a title and a valid invoice amount."
            });
        }

        const paid = Number(amountPaid || 0);

        if (!Number.isFinite(paid) || paid < 0 || paid > Number(amount)) {
            return res.status(400).json({
                message: "Paid amount must be between zero and the invoice amount."
            });
        }

        const invoice = await Invoice.create({
            title,
            amount: Number(amount),
            amountPaid: paid,
            status: getStatus(Number(amount), paid),
            dueDate: dueDate || undefined,
            description,
            event: event._id,
            createdBy: req.userId
        });

        res.status(201).json({
            message: "Invoice created successfully.",
            invoice
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE invoice
router.put("/item/:invoiceId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.invoiceId)) {
            return res.status(400).json({ message: "Invalid invoice ID." });
        }

        const invoice = await Invoice.findById(req.params.invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        const event = await getEventAccess(invoice.event, req.userId);

        if (!event || !canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "You are not allowed to edit this invoice."
            });
        }

        const title = req.body.title ?? invoice.title;
        const amount = Number(req.body.amount ?? invoice.amount);
        const amountPaid = Number(req.body.amountPaid ?? invoice.amountPaid);

        if (!title.trim() || !Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Enter a valid title and amount."
            });
        }

        if (!Number.isFinite(amountPaid) || amountPaid < 0 || amountPaid > amount) {
            return res.status(400).json({
                message: "Paid amount must be between zero and the invoice amount."
            });
        }

        invoice.title = title;
        invoice.amount = amount;
        invoice.amountPaid = amountPaid;
        invoice.status = getStatus(amount, amountPaid);
        invoice.dueDate = req.body.dueDate ?? invoice.dueDate;
        invoice.description = req.body.description ?? invoice.description;

        await invoice.save();

        res.json({
            message: "Invoice updated successfully.",
            invoice
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE invoice
router.delete("/item/:invoiceId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.invoiceId)) {
            return res.status(400).json({ message: "Invalid invoice ID." });
        }

        const invoice = await Invoice.findById(req.params.invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        const event = await getEventAccess(invoice.event, req.userId);

        if (!event || !canManageFinance(event, req.userId)) {
            return res.status(403).json({
                message: "You are not allowed to delete this invoice."
            });
        }

        await invoice.deleteOne();

        res.json({ message: "Invoice deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
