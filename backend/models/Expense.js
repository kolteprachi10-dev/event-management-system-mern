
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
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
    category: {
        type: String,
        enum: [
            "Venue",
            "Food",
            "Decoration",
            "Clothing",
            "Photography",
            "Transportation",
            "Entertainment",
            "Other"
        ],
        default: "Other"
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
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

module.exports = mongoose.model("Expense", expenseSchema);
