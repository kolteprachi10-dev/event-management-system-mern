
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/MyInvitations.css";

function MyInvitations() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // 1. GET ALL PENDING INVITATIONS
    const fetchInvitations = async () => {
        try {
            const response = await API.get(
                "/invitations/my-invitations",
                config
            );

            setInvitations(response.data.invitations || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to load invitations"
            );
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchInvitations();
    }, []);

    // 2. ACCEPT OR REJECT INVITATION
    const handleResponse = async (eventId, status) => {
        if (processingId) return;

        setProcessingId(eventId);
        setMessage("");
        setMessageType("");

        try {
            const response = await API.put(
                `/invitations/${eventId}/respond`,
                { status },
                config
            );

            setMessage(
                response.data.message ||
                `Invitation ${status.toLowerCase()} successfully`
            );
            setMessageType("success");

            await fetchInvitations();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to respond to invitation"
            );
            setMessageType("error");
        } finally {
            setProcessingId(null);
        }
    };

    // 3. REFRESH INVITATIONS
    const handleRefresh = async () => {
        setLoading(true);
        setMessage("");
        setMessageType("");
        await fetchInvitations();
    };

    if (loading) {
        return (
            <div className="invitations-loading">
                Loading invitations...
            </div>
        );
    }

    return (
        <div className="invitations-page">

            {/* HEADER */}
            <header className="invitations-header">
                <Link to="/dashboard" className="invitations-logo">
                    planora<span>.</span>
                </Link>

                <Link to="/dashboard" className="invitations-back">
                    ← Dashboard
                </Link>
            </header>

            <main className="invitations-container">

                {/* PAGE HEADING */}
                <div className="invitations-heading">
                    <div>
                        <span className="section-tag">
                            COLLABORATE
                        </span>

                        <h1>My Invitations</h1>

                        <p>
                            Manage the event invitations you've received.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-invitations-btn"
                        onClick={handleRefresh}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* MESSAGE */}
                {message && (
                    <div
                        className={`invitation-message ${messageType}`}
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {/* NO INVITATIONS */}
                {invitations.length === 0 ? (
                    <div className="no-invitations">
                        <div className="no-invitations-icon">
                            ✉
                        </div>

                        <h2>No Pending Invitations</h2>

                        <p>
                            When someone invites you to an event,
                            it will appear here.
                        </p>

                        <Link to="/dashboard">
                            Back to Dashboard
                        </Link>
                    </div>
                ) : (

                    /* INVITATION LIST */
                    <div className="invitation-list">

                        {invitations.map(event => {

                            const member = event.members?.find(
                                item =>
                                    item.user?._id?.toString() ===
                                    JSON.parse(
                                        localStorage.getItem("user") || "{}"
                                    )._id?.toString() &&
                                    item.status === "Pending"
                            ) || event.members?.find(
                                item => item.status === "Pending"
                            );

                            return (
                                <div
                                    className="invitation-card"
                                    key={event._id}
                                >

                                    {/* CARD HEADING */}
                                    <div className="invitation-card-top">
                                        <div>
                                            <span className="invitation-label">
                                                EVENT INVITATION
                                            </span>

                                            <h2>{event.title}</h2>
                                        </div>

                                        <span className="pending-badge">
                                            Pending
                                        </span>
                                    </div>

                                    {/* EVENT DETAILS */}
                                    <div className="invitation-info">

                                        <p>
                                            <strong>Invited by:</strong>{" "}
                                            {event.owner?.name || "Event owner"}
                                        </p>

                                        <p>
                                            <strong>Event type:</strong>{" "}
                                            {event.eventType}
                                        </p>

                                        <p>
                                            <strong>Event date:</strong>{" "}
                                            {event.date
                                                ? new Date(
                                                    event.date
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric"
                                                    }
                                                )
                                                : "Not added"}
                                        </p>

                                        <p>
                                            <strong>Location:</strong>{" "}
                                            {event.location || "Not added"}
                                        </p>

                                        <p>
                                            <strong>Your role:</strong>{" "}
                                            {member?.role || "Viewer"}
                                        </p>

                                        <p>
                                            <strong>Description:</strong>{" "}
                                            {event.description || "No description"}
                                        </p>

                                    </div>

                                    {/* ACTION BUTTONS */}
                                    <div className="invitation-actions">

                                        <button
                                            type="button"
                                            className="accept-invitation-btn"
                                            onClick={() =>
                                                handleResponse(
                                                    event._id,
                                                    "Accepted"
                                                )
                                            }
                                            disabled={processingId !== null}
                                        >
                                            {processingId === event._id
                                                ? "Please wait..."
                                                : "✓ Accept Invitation"}
                                        </button>

                                        <button
                                            type="button"
                                            className="reject-invitation-btn"
                                            onClick={() =>
                                                handleResponse(
                                                    event._id,
                                                    "Rejected"
                                                )
                                            }
                                            disabled={processingId !== null}
                                        >
                                            Reject
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </main>
        </div>
    );
}

export default MyInvitations;
