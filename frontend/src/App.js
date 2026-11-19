
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import MyInvitations from "./pages/MyInvitations";
import EventBudget from "./pages/EventBudget";
import EventInvoices from "./pages/EventInvoices";
import EventGuests from "./pages/EventGuests";
import EventVendors from "./pages/EventVendors";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/my-invitations" element={<MyInvitations />} />
                <Route path="/event/:id/budget" element={<EventBudget />} />
                <Route path="/event/:id/invoices" element={<EventInvoices />} />
                <Route path="/event/:id/guests" element={<EventGuests />} />
                <Route path="/event/:id/vendors" element={<EventVendors />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
