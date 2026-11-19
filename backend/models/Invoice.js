
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ["Pending", "Partially Paid", "Paid"],
        default: "Pending"
    },
    dueDate: {
        type: Date
    },
    description: {
        type: String,
        trim: true
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

module.exports = mongoose.model("Invoice", invoiceSchema);
