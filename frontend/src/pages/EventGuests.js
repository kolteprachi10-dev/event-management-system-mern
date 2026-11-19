
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api";
import "../styles/EventGuests.css";

function EventGuests() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const emptyForm = {
        name: "",
        email: "",
        phone: "",
        invitationStatus: "Not Sent",
        rsvpStatus: "Pending"
    };

    const [data, setData] = useState({
        guests: [],
        totalGuests: 0,
        accepted: 0,
        declined: 0,
        pending: 0,
        invitationsSent: 0,
        canManageGuests: false
    });

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [deleteId, setDeleteId] = useState(null);

    const fetchGuests = async () => {
        try {
            const response = await API.get(`/guests/${id}`, config);
            setData(response.data);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to load guests."
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

        fetchGuests();
    }, [id]);

    const handleChange = e => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            if (editingId) {
                await API.put(
                    `/guests/item/${editingId}`,
                    form,
                    config
                );
                setMessage("Guest updated successfully.");
            } else {
                await API.post(`/guests/${id}`, form, config);
                setMessage("Guest added successfully.");
            }

            setMessageType("success");
            resetForm();
            await fetchGuests();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to save guest."
            );
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = guest => {
        setEditingId(guest._id);
        setForm({
            name: guest.name || "",
            email: guest.email || "",
            phone: guest.phone || "",
            invitationStatus: guest.invitationStatus || "Not Sent",
            rsvpStatus: guest.rsvpStatus || "Pending"
        });

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/guests/item/${deleteId}`, config);
            setDeleteId(null);
            setMessage("Guest deleted successfully.");
            setMessageType("success");
            await fetchGuests();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to delete guest."
            );
            setMessageType("error");
            setDeleteId(null);
        }
    };

    const filteredGuests = data.guests.filter(guest =>
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="guest-loading">Loading guests...</div>;
    }

    return (
        <div className="guest-page">
            <header className="guest-header">
                <Link to={`/event/${id}`} className="guest-back">
                    ← Back to Event
                </Link>

                <span className="guest-label">EVENT ORGANIZATION</span>
                <h1>Guest Management</h1>
                <p>Manage your guest list and keep track of RSVPs.</p>
            </header>

            {message && (
                <div className={`guest-message ${messageType}`}>
                    {message}
                    <button onClick={() => setMessage("")}>×</button>
                </div>
            )}

            <section className="guest-summary">
                <div className="guest-summary-card">
                    <span>Total Guests</span>
                    <h2>{data.totalGuests}</h2>
                </div>

                <div className="guest-summary-card">
                    <span>Accepted</span>
                    <h2>{data.accepted}</h2>
                </div>

                <div className="guest-summary-card">
                    <span>Declined</span>
                    <h2>{data.declined}</h2>
                </div>

                <div className="guest-summary-card">
                    <span>Pending RSVP</span>
                    <h2>{data.pending}</h2>
                </div>

                <div className="guest-summary-card">
                    <span>Invitations Sent</span>
                    <h2>{data.invitationsSent}</h2>
                </div>
            </section>

            <section className="guest-section">
                <div className="guest-section-heading">
                    <div>
                        <span className="guest-label">GUEST DIRECTORY</span>
                        <h2>All Guests</h2>
                    </div>
                    <span>{filteredGuests.length} Guests</span>
                </div>

                <input
                    className="guest-search"
                    type="text"
                    placeholder="Search by guest name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {filteredGuests.length === 0 ? (
                    <div className="guest-empty">
                        <h3>No guests found</h3>
                        <p>
                            {search
                                ? "Try another search."
                                : "Add guests to start managing your guest list."}
                        </p>
                    </div>
                ) : (
                    <div className="guest-table-wrapper">
                        <table className="guest-table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Contact</th>
                                    <th>Invitation</th>
                                    <th>RSVP</th>
                                    {data.canManageGuests && <th>Actions</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredGuests.map(guest => (
                                    <tr key={guest._id}>
                                        <td>
                                            <strong>{guest.name}</strong>
                                        </td>

                                        <td>
                                            <span>{guest.email || "No email"}</span>
                                            <small>{guest.phone || "No phone"}</small>
                                        </td>

                                        <td>
                                            <span className={`guest-status ${guest.invitationStatus.toLowerCase().replace(" ", "-")}`}>
                                                {guest.invitationStatus}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`guest-status ${guest.rsvpStatus.toLowerCase().replace(" ", "-")}`}>
                                                {guest.rsvpStatus}
                                            </span>
                                        </td>

                                        {data.canManageGuests && (
                                            <td>
                                                <div className="guest-actions">
                                                    <button onClick={() => handleEdit(guest)}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="guest-delete"
                                                        onClick={() => setDeleteId(guest._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {data.canManageGuests && (
                <section className="guest-section guest-form-section">
                    <span className="guest-label">GUEST DETAILS</span>
                    <h2>{editingId ? "Edit Guest" : "Add New Guest"}</h2>

                    <form onSubmit={handleSubmit} className="guest-form">
                        <input
                            type="text"
                            name="name"
                            placeholder="Guest full name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email address (optional)"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone number (optional)"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <select
                            name="invitationStatus"
                            value={form.invitationStatus}
                            onChange={handleChange}
                        >
                            <option>Not Sent</option>
                            <option>Sent</option>
                        </select>

                        <select
                            name="rsvpStatus"
                            value={form.rsvpStatus}
                            onChange={handleChange}
                        >
                            <option>Pending</option>
                            <option>Accepted</option>
                            <option>Declined</option>
                        </select>

                        <div className="guest-form-buttons">
                            <button type="submit" disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Guest"
                                        : "Add Guest"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="guest-cancel"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            )}

            {deleteId && (
                <div className="guest-modal-overlay">
                    <div className="guest-delete-popup">
                        <h2>Delete Guest?</h2>
                        <p>
                            Are you sure you want to remove this guest from the event?
                        </p>

                        <div>
                            <button onClick={handleDelete}>
                                Yes, Delete
                            </button>
                            <button
                                className="guest-cancel"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventGuests;
