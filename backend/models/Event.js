
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    eventType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String
    },
    budget: {
    type: Number,
    default: 0,
    min: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role: {
                type: String,
                enum: [
                    "Task Manager",
                    "Finance Manager",
                    "Guest Manager",
                    "Viewer"
                ],
                default: "Viewer"
            },
            status: {
                type: String,
                enum: ["Pending", "Accepted", "Rejected"],
                default: "Pending"
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
