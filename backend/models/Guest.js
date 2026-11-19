
const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
    invitationStatus: {
        type: String,
        enum: ["Not Sent", "Sent"],
        default: "Not Sent"
    },
    rsvpStatus: {
        type: String,
        enum: ["Pending", "Accepted", "Declined"],
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

module.exports = mongoose.model("Guest", guestSchema);
