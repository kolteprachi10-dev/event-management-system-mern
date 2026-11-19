
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/Dashboard.css";

function Dashboard() {
    const [user, setUser] = useState({});
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [invitationCount, setInvitationCount] = useState(0);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token) {
            navigate("/login");
            return;
        }

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        fetchDashboardData();
    }, [navigate]);

    // FETCH DASHBOARD DATA
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // GET OWN EVENTS
            const eventResponse = await API.get(
                "/events/my-events",
                config
            );

            const ownEvents = eventResponse.data.events || [];

            // GET ACCEPTED SHARED EVENTS
            const sharedResponse = await API.get(
                "/invitations/shared-events",
                config
            );

            const sharedEvents = sharedResponse.data.events || [];

            // COMBINE OWN AND SHARED EVENTS
            const combinedEvents = [
                ...ownEvents,
                ...sharedEvents.filter(
                    sharedEvent =>
                        !ownEvents.some(
                            ownEvent =>
                                ownEvent._id === sharedEvent._id
                        )
                )
            ];

            setEvents(combinedEvents);

            // GET PENDING INVITATIONS
            const invitationResponse = await API.get(
                "/invitations/my-invitations",
                config
            );

            setInvitationCount(
                invitationResponse.data.count || 0
            );

            // GET TASKS OF OWN EVENTS FOR STATISTICS
            let allTasks = [];

            for (const event of ownEvents) {
                const taskResponse = await API.get(
                    `/tasks/event/${event._id}`,
                    config
                );

                const eventTasks = Array.isArray(taskResponse.data)
                    ? taskResponse.data
                    : taskResponse.data.tasks || [];

                allTasks = [...allTasks, ...eventTasks];
            }

            setTasks(allTasks);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to load dashboard"
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
        }
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // DASHBOARD STATISTICS
    const completedTasks = tasks.filter(
        task => task.status === "Completed"
    ).length;

    const upcomingEvents = events.filter(
        event => new Date(event.date) >= new Date()
    );

    return (
        <div className="dashboard-page">

            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">

                <Link to="/" className="dashboard-logo">
                    planora<span>.</span>
                </Link>

                <p className="sidebar-label">WORKSPACE</p>

                <Link to="/dashboard" className="sidebar-link active">
                    <span>⌂</span> Dashboard
                </Link>

                <Link to="/create-event" className="sidebar-link">
                    <span>＋</span> Create Event
                </Link>

                <Link to="/my-invitations" className="sidebar-link">
                    <span>✉</span> My Invitations
                    {invitationCount > 0 && (
                        <span className="invitation-count">
                            {invitationCount}
                        </span>
                    )}
                </Link>

                <p className="sidebar-label">ACCOUNT</p>

                <button
                    className="sidebar-link logout-button"
                    onClick={handleLogout}
                >
                    <span>↪</span> Logout
                </button>

                <div className="sidebar-bottom">
                    <div className="sidebar-avatar">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>
                        <strong>{user.name || "User"}</strong>
                        <span>Personal Workspace</span>
                    </div>
                </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className="dashboard-main">

                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <span className="section-tag">
                            YOUR PERSONAL WORKSPACE
                        </span>

                        <h1>Dashboard</h1>

                        <p>
                            Here's what's happening with your events.
                        </p>
                    </div>

                    <Link
                        to="/create-event"
                        className="dashboard-create-btn"
                    >
                        + Create Event
                    </Link>
                </header>

                {/* WELCOME SECTION */}
                <section className="dashboard-welcome">
                    <div>
                        <span>WELCOME BACK</span>

                        <h2>
                            Hello, {user.name?.split(" ")[0] || "there"}!
                        </h2>

                        <p>
                            Let's make your next celebration
                            something special.
                        </p>
                    </div>

                    <div className="welcome-decoration">✦</div>
                </section>

                {/* STATISTICS */}
                <section className="dashboard-stats">

                    <div className="stat-card">
                        <span className="stat-icon">✿</span>
                        <p>Total Events</p>
                        <h2>{events.length}</h2>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon sage-icon">◷</span>
                        <p>Upcoming Events</p>
                        <h2>{upcomingEvents.length}</h2>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon gold-icon">✓</span>
                        <p>Completed Tasks</p>
                        <h2>{completedTasks}</h2>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon plum-icon">☷</span>
                        <p>Total Tasks</p>
                        <h2>{tasks.length}</h2>
                    </div>

                </section>

                {/* RECENT EVENTS */}
                <section className="dashboard-section">

                    <div className="dashboard-section-heading">
                        <div>
                            <span className="section-tag">YOUR PLANS</span>
                            <h2>Recent Events</h2>
                        </div>

                        <Link to="/create-event">
                            + New Event
                        </Link>
                    </div>

                    {events.length === 0 ? (
                        <div className="dashboard-empty">

                            <div>✿</div>

                            <h3>Your event journey starts here!</h3>

                            <p>
                                You haven't created or joined any events yet.
                                Create your first event or accept an invitation.
                            </p>

                            <Link to="/create-event">
                                Create Your First Event ↗
                            </Link>

                        </div>
                    ) : (
                        <div className="dashboard-event-grid">

                            {events.slice(0, 4).map(event => {

                                const isOwner =
                                    event.owner?._id === user._id ||
                                    event.owner === user._id;

                                return (
                                    <div
                                        className="dashboard-event-card"
                                        key={event._id}
                                    >

                                        <span className="event-type-label">
                                            {event.eventType || "EVENT"}
                                        </span>

                                        <h3>{event.title}</h3>

                                        <p>
                                            ◷ {new Date(
                                                event.date
                                            ).toLocaleDateString()}
                                        </p>

                                        <p>
                                            ⌖ {event.location || "Location not added"}
                                        </p>

                                        {!isOwner && (
                                            <p>
                                                Shared by: {event.owner?.name || "Event owner"}
                                            </p>
                                        )}

                                        <Link to={`/event/${event._id}`}>
                                            View Details →
                                        </Link>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </section>

                {/* ERROR MESSAGE */}
                {message && (
                    <p className="dashboard-message">
                        {message}
                    </p>
                )}

            </main>
        </div>
    );
}

export default Dashboard;
