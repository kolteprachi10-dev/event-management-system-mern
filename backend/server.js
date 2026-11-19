
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Error:", err));

app.get("/", (req, res) => {
    res.send("Event Management API is running!");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const invitationRoutes = require("./routes/invitationRoutes");
app.use("/api/invitations", invitationRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/api/expenses", expenseRoutes);

const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/api/invoices", invoiceRoutes);

const guestRoutes = require("./routes/guestRoutes");
app.use("/api/guests", guestRoutes);

const vendorRoutes = require("./routes/vendorRoutes");
app.use("/api/vendors", vendorRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
