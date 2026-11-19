
import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function Login() {
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
            const response = await API.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/dashboard");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Login failed"
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
                            WELCOME BACK
                        </span>

                        <h2>
                            Your next great moment
                            starts <span>here.</span>
                        </h2>

                        <p>
                            Your events, plans and people are
                            waiting for you. Let's get things organized.
                        </p>
                    </div>

                    <div className="auth-side-footer">
                        Thoughtfully organized. Beautifully celebrated.
                    </div>
                </div>

                <div className="auth-form-section">
                    <h2>Welcome Back!</h2>

                    <p className="auth-subtitle">
                        Login to continue planning your events.
                    </p>

                    <form className="auth-form" onSubmit={handleSubmit}>

                        <label htmlFor="login-email">
                            Email Address
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login to Your Account ↗"}
                        </button>
                    </form>

                    {message && (
                        <p className="auth-message">{message}</p>
                    )}

                    <p className="auth-switch">
                        Don't have an account?
                        <Link to="/register"> Create Account</Link>
                    </p>

                    <Link to="/" className="auth-home-link">
                        ← Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Login;
