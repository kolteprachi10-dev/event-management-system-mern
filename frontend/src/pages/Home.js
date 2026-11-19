
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    return (
        <div className="home-page">
            {/* Navbar */}
            <nav className="home-navbar">
                <Link to="/" className="home-logo">
                    planora<span>.</span>
                </Link>

                <div className="home-nav-links">
                    <a href="#events">Explore</a>
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <Link to="/login">Login</Link>
                    <Link to="/register" className="home-nav-btn">
                        Get Started ↗
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="home-hero">
                <div className="hero-content">
                    <span className="home-tag">
                        PLAN BETTER. CELEBRATE TOGETHER.
                    </span>

                    <h1>
                        Good plans make
                        room for <span>great moments.</span>
                    </h1>

                    <p>
                        From small family gatherings to grand celebrations,
                        organize every detail, manage your plans and bring
                        everyone together in one place.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="hero-primary">
                            Start Planning ↗
                        </Link>
                        <a href="#features" className="hero-secondary">
                            Discover More →
                        </a>
                    </div>

                    <div className="hero-caption">
                        ✦ Made for every celebration, big or small.
                    </div>
                </div>

                {/* Hero Preview */}
                <div className="hero-preview">
                    <div className="preview-heading">
                        <span>YOUR PLANNING SPACE</span>
                        <span>✦</span>
                    </div>

                    <div className="preview-main">
                        <div className="preview-top">
                            <span>UPCOMING EVENT</span>
                            <span className="event-status">Planning</span>
                        </div>

                        <h2>Family Get Together</h2>
                        <p className="preview-date">
                            15 February 2027 · Mumbai
                        </p>

                        <div className="preview-line"></div>

                        <div className="preview-progress">
                            <span>Planning progress</span>
                            <strong>75%</strong>
                        </div>

                        <div className="progress-track">
                            <div></div>
                        </div>

                        <div className="preview-stats">
                            <div>
                                <strong>12</strong>
                                <span>Tasks</span>
                            </div>
                            <div>
                                <strong>08</strong>
                                <span>Guests</span>
                            </div>
                            <div>
                                <strong>04</strong>
                                <span>Members</span>
                            </div>
                        </div>
                    </div>

                    <div className="preview-task">
                        <span className="task-check">✓</span>
                        <div>
                            <strong>Venue arrangements</strong>
                            <p>Task completed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="intro-section">
                <span className="section-tag">A LITTLE MORE ORGANIZED</span>
                <h2>
                    Every celebration has a lot of details.
                    <span> We bring them together.</span>
                </h2>
                <p>
                    No scattered notes, forgotten tasks or confusing plans.
                    Planora gives you one organized space for everything
                    your event needs.
                </p>
            </section>

            {/* Event Types */}
            <section className="event-section" id="events">
                <div className="section-heading">
                    <div>
                        <span className="section-tag">MADE FOR EVERY OCCASION</span>
                        <h2>Whatever you're celebrating.</h2>
                    </div>
                    <p>One platform for moments of every size.</p>
                </div>

                <div className="event-grid">
                    <div className="event-card birthday">
                        <div className="event-card-content">
                            <span>01 / CELEBRATE</span>
                            <h3>Birthdays & Parties</h3>
                            <p>Make every special day memorable.</p>
                        </div>
                    </div>

                    <div className="event-card family">
                        <div className="event-card-content">
                            <span>02 / CONNECT</span>
                            <h3>Family Gatherings</h3>
                            <p>Bring your favourite people together.</p>
                        </div>
                    </div>

                    <div className="event-card wedding">
                        <div className="event-card-content">
                            <span>03 / BIG MOMENTS</span>
                            <h3>Weddings</h3>
                            <p>Keep every important detail organized.</p>
                        </div>
                    </div>

                    <div className="event-card festival">
                        <div className="event-card-content">
                            <span>04 / FESTIVITIES</span>
                            <h3>Festive Celebrations</h3>
                            <p>Plan the joy, not the stress.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section" id="features">
                <div className="features-heading">
                    <span className="section-tag">YOUR COMPLETE PLANNING SPACE</span>
                    <h2>Everything you need.<br />
                        Nothing left behind.
                    </h2>
                    <p>
                        All your event essentials, thoughtfully organized
                        in one place.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-item">
                        <span>01</span>
                        <div className="feature-symbol">✿</div>
                        <h3>Event Management</h3>
                        <p>Create events, add important details and
                           manage all your celebrations.</p>
                    </div>

                    <div className="feature-item">
                        <span>02</span>
                        <div className="feature-symbol">✓</div>
                        <h3>Tasks & Deadlines</h3>
                        <p>Divide responsibilities, set deadlines
                           and track your progress.</p>
                    </div>

                    <div className="feature-item">
                        <span>03</span>
                        <div className="feature-symbol">₹</div>
                        <h3>Budget & Expenses</h3>
                        <p>Plan your spending and keep track
                           of every expense.</p>
                    </div>

                    <div className="feature-item">
                        <span>04</span>
                        <div className="feature-symbol">♡</div>
                        <h3>Guest Management</h3>
                        <p>Organize guest information and
                           keep invitations in order.</p>
                    </div>

                    <div className="feature-item">
                        <span>05</span>
                        <div className="feature-symbol">♧</div>
                        <h3>Team Collaboration</h3>
                        <p>Invite friends and family to help
                           organize the same event.</p>
                    </div>

                    <div className="feature-item">
                        <span>06</span>
                        <div className="feature-symbol">◇</div>
                        <h3>Vendor Management</h3>
                        <p>Keep vendor details, bookings and
                           arrangements together.</p>
                    </div>
                </div>
            </section>

            {/* Collaboration */}
            <section className="collab-section">
                <div className="collab-content">
                    <span className="section-tag">BETTER WHEN PLANNED TOGETHER</span>
                    <h2>Because the best moments are shared.</h2>
                    <p>
                        Planning doesn't have to be a one-person job.
                        Invite your family and friends to the same event.
                        Share tasks, manage expenses and make decisions
                        together.
                    </p>
                    <Link to="/register" className="collab-btn">
                        Plan Together ↗
                    </Link>
                </div>

                <div className="collab-visual">
                    <div className="collab-card">
                        <span>SHARED EVENT</span>
                        <h3>Birthday Celebration</h3>
                        <p>Everyone has a part to play.</p>
                        <div className="member-list">
                            <div className="member-circle">P</div>
                            <div className="member-circle">A</div>
                            <div className="member-circle">S</div>
                            <div className="member-circle">R</div>
                        </div>
                        <div className="collab-divider"></div>
                        <div className="collab-task">
                            <span>✓</span> Decoration planning
                        </div>
                        <div className="collab-task">
                            <span>✓</span> Guest arrangements
                        </div>
                        <div className="collab-task">
                            <span>○</span> Food arrangements
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-section" id="how-it-works">
                <span className="section-tag">GET STARTED IN THREE STEPS</span>
                <h2>Simple to start.<br />Easy to organize.</h2>

                <div className="steps-grid">
                    <div className="step-item">
                        <span>01</span>
                        <h3>Create your event</h3>
                        <p>Add your event name, date, location
                           and other important details.</p>
                    </div>

                    <div className="step-item">
                        <span>02</span>
                        <h3>Organize everything</h3>
                        <p>Manage tasks, guests, expenses
                           and all your arrangements.</p>
                    </div>

                    <div className="step-item">
                        <span>03</span>
                        <h3>Bring people together</h3>
                        <p>Invite your people, share responsibilities
                           and enjoy the celebration.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="home-cta">
                <span className="section-tag">YOUR NEXT EVENT STARTS HERE</span>
                <h2>Make room for more<br />beautiful moments.</h2>
                <p>Start planning your next celebration with Planora.</p>
                <Link to="/register" className="hero-primary">
                    Create Your Account ↗
                </Link>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <Link to="/" className="home-logo">
                    planora<span>.</span>
                </Link>
                <p>Thoughtfully organized. Beautifully celebrated.</p>
                <span>© 2026 Planora. All rights reserved.</span>
            </footer>
        </div>
    );
}

export default Home;
