
const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: [
            "Catering",
            "Decoration",
            "Photography",
            "Venue",
            "Music",
            "Transportation",
            "Clothing",
            "Other"
        ],
        default: "Other"
    },
    contactPerson: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ""
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    services: {
        type: String,
        trim: true,
        default: ""
    },
    cost: {
        type: Number,
        default: 0,
        min: 0
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    bookingStatus: {
        type: String,
        enum: ["Not Contacted", "Contacted", "Booked", "Cancelled"],
        default: "Not Contacted"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Partially Paid", "Paid"],
        default: "Pending"
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Vendor", vendorSchema);
