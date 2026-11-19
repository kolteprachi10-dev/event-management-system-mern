
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/CreateEvent.css";

function CreateEvent() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eventType: "",
        date: "",
        location: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            const response = await API.post(
                "/events/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message || "Event created successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to create event"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-event-page">
            <div className="create-event-top">
                <Link to="/dashboard" className="create-event-logo">
                    planora<span>.</span>
                </Link>
                <Link to="/dashboard" className="back-dashboard">
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="create-event-container">
                <div className="create-event-heading">
                    <span className="section-tag">LET'S GET PLANNING</span>
                    <h1>Create your <span>event.</span></h1>
                    <p>Start with the basics. You can organize all the little details later.</p>
                </div>

                <form className="create-event-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Name *</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Priya's Birthday Celebration"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Type *</label>
                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select event type</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Family Gathering">Family Gathering</option>
                                <option value="Festival">Festival</option>
                                <option value="College Event">College Event</option>
                                <option value="Party">Party</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Event Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            placeholder="Where will your event take place?"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Tell us a little about your event..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    {message && <p className="create-event-message">{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Event..." : "Create Event →"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateEvent;
