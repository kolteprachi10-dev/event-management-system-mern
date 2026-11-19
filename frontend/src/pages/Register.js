
import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await API.post("/auth/register", {
                name,
                email,
                password
            });

            setMessage(response.data.message);
            navigate("/login");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">

                <div className="auth-side">
                    <Link to="/" className="auth-brand">
                        planora<span>.</span>
                    </Link>

                    <div className="auth-side-content">
                        <span className="auth-small-title">
                            LET'S GET STARTED
                        </span>

                        <h2>
                            Every beautiful event
                            begins with a <span>plan.</span>
                        </h2>

                        <p>
                            Create your account and bring all your
                            event ideas, tasks and people together.
                        </p>
                    </div>

                    <div className="auth-side-footer">
                        Make room for more beautiful moments.
                    </div>
                </div>

                <div className="auth-form-section">
                    <h2>Create Account</h2>

                    <p className="auth-subtitle">
                        Join Planora and start organizing your events.
                    </p>

                    <form className="auth-form" onSubmit={handleSubmit}>

                        <label htmlFor="register-name">
                            Full Name
                        </label>

                        <input
                            id="register-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <label htmlFor="register-email">
                            Email Address
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create My Account ↗"}
                        </button>
                    </form>

                    {message && (
                        <p className="auth-message">{message}</p>
                    )}

                    <p className="auth-switch">
                        Already have an account?
                        <Link to="/login"> Login</Link>
                    </p>

                    <Link to="/" className="auth-home-link">
                        ← Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Register;
