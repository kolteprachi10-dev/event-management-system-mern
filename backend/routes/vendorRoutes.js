
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Vendor = require("../models/Vendor");
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

    return isOwner || isAcceptedMember ? event : null;
};

const canManageVendors = (event, userId) => {
    const isOwner = event.owner.toString() === userId.toString();

    const isVendorManager = event.members?.some(member =>
        member.user.toString() === userId.toString() &&
        member.status === "Accepted" &&
        member.role === "Vendor Manager"
    );

    return isOwner || isVendorManager;
};

const updatePaymentStatus = vendor => {
    if (vendor.amountPaid === 0) {
        vendor.paymentStatus = "Pending";
    } else if (vendor.amountPaid >= vendor.cost) {
        vendor.paymentStatus = "Paid";
    } else {
        vendor.paymentStatus = "Partially Paid";
    }
};

const validateAmounts = (cost, amountPaid) => {
    return (
        Number.isFinite(Number(cost)) &&
        Number.isFinite(Number(amountPaid)) &&
        Number(cost) >= 0 &&
        Number(amountPaid) >= 0 &&
        Number(amountPaid) <= Number(cost)
    );
};

// GET vendors and statistics
router.get("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied."
            });
        }

        const vendors = await Vendor.find({ event: event._id })
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        const totalVendors = vendors.length;
        const booked = vendors.filter(v => v.bookingStatus === "Booked").length;
        const contacted = vendors.filter(v => v.bookingStatus === "Contacted").length;
        const notContacted = vendors.filter(v => v.bookingStatus === "Not Contacted").length;
        const cancelled = vendors.filter(v => v.bookingStatus === "Cancelled").length;

        const totalCost = vendors.reduce((sum, v) => sum + v.cost, 0);
        const totalPaid = vendors.reduce((sum, v) => sum + v.amountPaid, 0);

        res.json({
            vendors,
            totalVendors,
            booked,
            contacted,
            notContacted,
            cancelled,
            totalCost,
            totalPaid,
            remainingAmount: totalCost - totalPaid,
            canManageVendors: canManageVendors(event, req.userId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD vendor
router.post("/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await getEventAccess(req.params.eventId, req.userId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found or access denied."
            });
        }

        if (!canManageVendors(event, req.userId)) {
            return res.status(403).json({
                message: "Only the owner or Vendor Manager can manage vendors."
            });
        }

        const {
            name, category, contactPerson, email, phone,
            services, cost = 0, amountPaid = 0, bookingStatus
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Vendor name is required."
            });
        }

        if (!validateAmounts(cost, amountPaid)) {
            return res.status(400).json({
                message: "Enter valid cost and payment amounts. Amount paid cannot exceed cost."
            });
        }

        const vendor = new Vendor({
            name,
            category,
            contactPerson,
            email,
            phone,
            services,
            cost: Number(cost),
            amountPaid: Number(amountPaid),
            bookingStatus: bookingStatus || "Not Contacted",
            event: event._id,
            createdBy: req.userId
        });

        updatePaymentStatus(vendor);
        await vendor.save();

        res.status(201).json({
            message: "Vendor added successfully.",
            vendor
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE vendor
router.put("/item/:vendorId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.vendorId)) {
            return res.status(400).json({ message: "Invalid vendor ID." });
        }

        const vendor = await Vendor.findById(req.params.vendorId);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        const event = await getEventAccess(vendor.event, req.userId);

        if (!event || !canManageVendors(event, req.userId)) {
            return res.status(403).json({
                message: "You are not allowed to update this vendor."
            });
        }

        const name = req.body.name ?? vendor.name;
        const cost = req.body.cost ?? vendor.cost;
        const amountPaid = req.body.amountPaid ?? vendor.amountPaid;

        if (!name.trim()) {
            return res.status(400).json({
                message: "Vendor name is required."
            });
        }

        if (!validateAmounts(cost, amountPaid)) {
            return res.status(400).json({
                message: "Enter valid cost and payment amounts. Amount paid cannot exceed cost."
            });
        }

        vendor.name = name;
        vendor.category = req.body.category ?? vendor.category;
        vendor.contactPerson = req.body.contactPerson ?? vendor.contactPerson;
        vendor.email = req.body.email ?? vendor.email;
        vendor.phone = req.body.phone ?? vendor.phone;
        vendor.services = req.body.services ?? vendor.services;
        vendor.cost = Number(cost);
        vendor.amountPaid = Number(amountPaid);
        vendor.bookingStatus = req.body.bookingStatus ?? vendor.bookingStatus;

        updatePaymentStatus(vendor);
        await vendor.save();

        res.json({
            message: "Vendor updated successfully.",
            vendor
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE vendor
router.delete("/item/:vendorId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.vendorId)) {
            return res.status(400).json({ message: "Invalid vendor ID." });
        }

        const vendor = await Vendor.findById(req.params.vendorId);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        const event = await getEventAccess(vendor.event, req.userId);

        if (!event || !canManageVendors(event, req.userId)) {
            return res.status(403).json({
                message: "You are not allowed to delete this vendor."
            });
        }

        await vendor.deleteOne();

        res.json({ message: "Vendor deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
