
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api";
import "../styles/EventDetails.css";

function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user._id;
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const [event, setEvent] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [taskMessage, setTaskMessage] = useState("");

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Task Manager");
    const [inviteMessage, setInviteMessage] = useState("");

    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium"
    });
    const [editingTask, setEditingTask] = useState(null);

    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        eventType: "",
        date: "",
        location: ""
    });
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [showDeleteEvent, setShowDeleteEvent] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);

    const isEventOwner =
        event?.owner &&
        (event.owner._id || event.owner).toString() === userId?.toString();

    const currentMember = event?.members?.find(member =>
        (member.user?._id || member.user)?.toString() === userId?.toString() &&
        member.status === "Accepted"
    );

    const canManageTasks =
        isEventOwner || currentMember?.role === "Task Manager";

    const canAccess = isEventOwner || currentMember;

    const fetchEvent = async () => {
        try {
            const response = await API.get(`/events/${id}`, config);
            const eventData = response.data.event || response.data;
            setEvent(eventData);
            setEventForm({
                title: eventData.title || "",
                description: eventData.description || "",
                eventType: eventData.eventType || "",
                date: eventData.date
                    ? new Date(eventData.date).toISOString().split("T")[0]
                    : "",
                location: eventData.location || ""
            });
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to load event."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await API.get(`/tasks/event/${id}`, config);
            setTasks(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.tasks || []
            );
            setTaskMessage("");
        } catch (error) {
            setTaskMessage(
                error.response?.data?.message || "Unable to load tasks."
            );
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchEvent();
        fetchTasks();
    }, [id]);

    const handleInvite = async e => {
        e.preventDefault();
        setInviteMessage("");

        try {
            const response = await API.post(
                `/invitations/${id}/invite`,
                { email: inviteEmail.trim().toLowerCase(), role: inviteRole },
                config
            );
            setInviteMessage(response.data.message || "Invitation sent.");
            setInviteEmail("");
            fetchEvent();
        } catch (error) {
            setInviteMessage(
                error.response?.data?.message || "Unable to send invitation."
            );
        }
    };

    const handleEventUpdate = async e => {
        e.preventDefault();
        try {
            await API.put(`/events/${id}`, eventForm, config);
            setShowEditEvent(false);
            setMessage("Event updated successfully.");
            fetchEvent();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to update event."
            );
        }
    };

    const handleEventDelete = async () => {
        try {
            await API.delete(`/events/${id}`, config);
            navigate("/dashboard");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to delete event."
            );
            setShowDeleteEvent(false);
        }
    };

    const handleTaskChange = e => {
        setTaskForm({
            ...taskForm,
            [e.target.name]: e.target.value
        });
    };

    const handleTaskSubmit = async e => {
        e.preventDefault();
        setTaskMessage("");

        try {
            if (editingTask) {
                await API.put(`/tasks/${editingTask}`, taskForm, config);
                setTaskMessage("Task updated successfully.");
            } else {
                await API.post(`/tasks/create/${id}`, taskForm, config);
                setTaskMessage("Task created successfully.");
            }

            setTaskForm({
                title: "",
                description: "",
                dueDate: "",
                priority: "Medium"
            });
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            setTaskMessage(
                error.response?.data?.message || "Unable to save task."
            );
        }
    };

    const handleTaskEdit = task => {
        setEditingTask(task._id);
        setTaskForm({
            title: task.title || "",
            description: task.description || "",
            dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : "",
            priority: task.priority || "Medium"
        });
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleTaskDelete = async () => {
        try {
            await API.delete(`/tasks/${deleteTaskId}`, config);
            setDeleteTaskId(null);
            setTaskMessage("Task deleted successfully.");
            fetchTasks();
        } catch (error) {
            setTaskMessage(
                error.response?.data?.message || "Unable to delete task."
            );
            setDeleteTaskId(null);
        }
    };

    const cancelTaskEdit = () => {
        setEditingTask(null);
        setTaskForm({
            title: "",
            description: "",
            dueDate: "",
            priority: "Medium"
        });
    };

    if (loading) {
        return <div className="event-loading">Loading event...</div>;
    }

    if (!event) {
        return (
            <div className="event-loading">
                {message || "Event not found."}
                <br />
                <Link to="/dashboard">Back to Dashboard</Link>
            </div>
        );
    }

    if (!canAccess) {
        return (
            <div className="event-loading">
                You do not have access to this event.
                <br />
                <Link to="/dashboard">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="event-details-page">
            <header className="event-details-header">
                <Link to="/dashboard" className="event-back">
                    ← Back to Dashboard
                </Link>

                <div className="event-header-content">
                    <div>
                        <span className="event-label">EVENT OVERVIEW</span>
                        <h1>{event.title}</h1>
                        <p>{event.eventType}</p>
                    </div>

                    {isEventOwner && (
                        <div className="event-header-actions">
                            <button onClick={() => setShowEditEvent(true)}>
                                Edit Event
                            </button>
                            <button
                                className="event-delete-button"
                                onClick={() => setShowDeleteEvent(true)}
                            >
                                Delete Event
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {message && (
                <div className="event-message">
                    {message}
                    <button onClick={() => setMessage("")}>×</button>
                </div>
            )}

            <section className="event-info">
                <div className="event-info-card">
                    <span>Event Date</span>
                    <h3>
                        {event.date
                            ? new Date(event.date).toLocaleDateString()
                            : "Not specified"}
                    </h3>
                </div>
                <div className="event-info-card">
                    <span>Location</span>
                    <h3>{event.location || "Not specified"}</h3>
                </div>
                <div className="event-info-card">
                    <span>Created By</span>
                    <h3>{event.owner?.name || "Event Owner"}</h3>
                </div>
            </section>

            <section className="event-description">
                <h2>About This Event</h2>
                <p>{event.description || "No description added."}</p>
            </section>

            <Link to={`/event/${id}/budget`} className="budget-link">
                Manage Budget & Expenses →
            </Link>

            <Link to={`/event/${id}/invoices`} className="invoice-page-link">
                Manage Invoices →
            </Link>

            <Link to={`/event/${id}/guests`} className="guest-page-link">
                Manage Guests →
            </Link>
            
            <Link to={`/event/${id}/vendors`} className="vendor-page-link">
                Manage Vendors →
            </Link>
            <section className="event-members">
                <div className="section-heading">
                    <div>
                        <span className="event-label">COLLABORATION</span>
                        <h2>Event Members</h2>
                    </div>
                    <span className="member-count">
                        {event.members?.filter(m => m.status === "Accepted").length || 0} Members
                    </span>
                </div>

                <div className="member-list">
                    <div className="member-card">
                        <div className="member-avatar">
                            {event.owner?.name?.charAt(0).toUpperCase() || "O"}
                        </div>
                        <div>
                            <h3>{event.owner?.name || "Event Owner"}</h3>
                            <p>{event.owner?.email || ""}</p>
                        </div>
                        <span className="member-role owner-role">Owner</span>
                    </div>

                    {event.members?.filter(m => m.status === "Accepted").map(member => (
                        <div className="member-card" key={member._id}>
                            <div className="member-avatar">
                                {(member.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3>{member.user?.name || "Member"}</h3>
                                <p>{member.user?.email || ""}</p>
                            </div>
                            <span className="member-role">{member.role}</span>
                        </div>
                    ))}
                </div>
            </section>

            {isEventOwner && (
                <section className="invite-section">
                    <span className="event-label">BUILD YOUR TEAM</span>
                    <h2>Invite Someone</h2>
                    <p>Invite registered users to collaborate on this event.</p>

                    <form onSubmit={handleInvite} className="invite-form">
                        <input
                            type="email"
                            placeholder="Enter registered user's email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            required
                        />
                        <select
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                        >
                            <option>Task Manager</option>
                            <option>Finance Manager</option>
                            <option>Guest Manager</option>
                            <option>Vendor Manager</option>
                            <option>Viewer</option>
                        </select>
                        <button type="submit">Send Invitation</button>
                    </form>

                    {inviteMessage && (
                        <p className="invite-feedback">{inviteMessage}</p>
                    )}
                </section>
            )}

            <section className="event-tasks">
                <div className="section-heading">
                    <div>
                        <span className="event-label">STAY ORGANIZED</span>
                        <h2>Event Tasks</h2>
                    </div>
                    <span className="member-count">{tasks.length} Tasks</span>
                </div>

                {taskMessage && (
                    <div className="event-message">
                        {taskMessage}
                        <button onClick={() => setTaskMessage("")}>×</button>
                    </div>
                )}

                <div className="task-list">
                    {tasks.length === 0 ? (
                        <div className="empty-tasks">
                            <h3>No tasks added yet</h3>
                            <p>Start organizing your event by adding tasks.</p>
                        </div>
                    ) : (
                        tasks.map(task => {
                            const isCreator =
                                (task.createdBy?._id || task.createdBy)?.toString() === userId?.toString();

                            const canEditTask = canManageTasks || isCreator;

                            return (
                                <div className="task-card" key={task._id}>
                                    <div className="task-card-content">
                                        <span className={`task-status ${task.status?.toLowerCase().replace(" ", "-")}`}>
                                            {task.status}
                                        </span>
                                        <h3>{task.title}</h3>
                                        <p>{task.description || "No description"}</p>
                                        <small>
                                            Due: {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "Not specified"}
                                        </small>
                                    </div>

                                    <div className="task-card-right">
                                        <span className={`task-priority ${task.priority?.toLowerCase()}`}>
                                            {task.priority} Priority
                                        </span>
                                        {canEditTask && (
                                            <div className="task-actions">
                                                <button onClick={() => handleTaskEdit(task)}>
                                                    Edit
                                                </button>
                                                <button
                                                    className="task-delete-button"
                                                    onClick={() => setDeleteTaskId(task._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {canManageTasks && (
                    <div className="task-form-section">
                        <h2>{editingTask ? "Update Task" : "Add New Task"}</h2>
                        <form onSubmit={handleTaskSubmit} className="task-form">
                            <input
                                type="text"
                                name="title"
                                placeholder="Task title"
                                value={taskForm.title}
                                onChange={handleTaskChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Task description"
                                value={taskForm.description}
                                onChange={handleTaskChange}
                            />
                            <div className="task-form-row">
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={taskForm.dueDate}
                                    onChange={handleTaskChange}
                                />
                                <select
                                    name="priority"
                                    value={taskForm.priority}
                                    onChange={handleTaskChange}
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                            <div className="task-form-buttons">
                                <button type="submit">
                                    {editingTask ? "Update Task" : "Add Task"}
                                </button>
                                {editingTask && (
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={cancelTaskEdit}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </section>

            {showEditEvent && (
                <div className="event-modal-overlay">
                    <div className="event-modal">
                        <h2>Edit Event</h2>
                        <form onSubmit={handleEventUpdate}>
                            <input
                                value={eventForm.title}
                                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                placeholder="Event title"
                                required
                            />
                            <textarea
                                value={eventForm.description}
                                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                placeholder="Description"
                            />
                            <select
                                value={eventForm.eventType}
                                onChange={e => setEventForm({ ...eventForm, eventType: e.target.value })}
                                required
                            >
                                <option value="">Select event type</option>
                                <option>Wedding</option>
                                <option>Birthday</option>
                                <option>College Event</option>
                                <option>Festival</option>
                                <option>Family Gathering</option>
                                <option>Other</option>
                            </select>
                            <input
                                type="date"
                                value={eventForm.date}
                                onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                required
                            />
                            <input
                                value={eventForm.location}
                                onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                placeholder="Location"
                            />
                            <div className="modal-buttons">
                                <button type="submit">Save Changes</button>
                                <button type="button" className="cancel-button" onClick={() => setShowEditEvent(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {(showDeleteEvent || deleteTaskId) && (
                <div className="event-modal-overlay">
                    <div className="delete-popup">
                        <h2>Are you sure?</h2>
                        <p>
                            {showDeleteEvent
                                ? "This will permanently delete this event."
                                : "This will permanently delete this task."}
                        </p>
                        <div className="modal-buttons">
                            <button
                                className="confirm-delete"
                                onClick={showDeleteEvent ? handleEventDelete : handleTaskDelete}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setShowDeleteEvent(false);
                                    setDeleteTaskId(null);
                                }}
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

export default EventDetails;
