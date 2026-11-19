
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api";
import "../styles/EventBudget.css";

function EventBudget() {
    const { id } = useParams();
    const token = localStorage.getItem("token");
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const [data, setData] = useState({
        budget: 0,
        totalSpent: 0,
        remaining: 0,
        expenses: [],
        canManageFinance: false,
        event: null
    });

    const [budget, setBudget] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "Other",
        description: "",
        date: new Date().toISOString().split("T")[0]
    });

    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            const response = await API.get(`/expenses/${id}`, config);
            setData(response.data);
            setBudget(response.data.budget ?? 0);
        } catch (error) {
            showMessage(
                error.response?.data?.message || "Unable to load budget",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }

        fetchData();
    }, [id]);

    const isOwner = data.event?.owner &&
        (data.event.owner._id || data.event.owner).toString() ===
        (JSON.parse(localStorage.getItem("user") || "{}").id ||
         JSON.parse(localStorage.getItem("user") || "{}")._id)?.toString();

    const canManage = isOwner || data.canManageFinance;

    function showMessage(text, type) {
        setMessage(text);
        setMessageType(type);
    }

    const saveBudget = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await API.put(
                `/expenses/${id}/budget`,
                { budget: Number(budget) },
                config
            );

            showMessage("Budget updated successfully!", "success");
            await fetchData();
        } catch (error) {
            showMessage(
                error.response?.data?.message || "Unable to update budget",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            title: "",
            amount: "",
            category: "Other",
            description: "",
            date: new Date().toISOString().split("T")[0]
        });
    };

    const saveExpense = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingId) {
                await API.put(
                    `/expenses/item/${editingId}`,
                    form,
                    config
                );
                showMessage("Expense updated successfully!", "success");
            } else {
                await API.post(
                    `/expenses/${id}`,
                    form,
                    config
                );
                showMessage("Expense added successfully!", "success");
            }

            resetForm();
            await fetchData();

        } catch (error) {
            showMessage(
                error.response?.data?.message || "Unable to save expense",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const editExpense = (expense) => {
        setEditingId(expense._id);

        setForm({
            title: expense.title,
            amount: expense.amount,
            category: expense.category || "Other",
            description: expense.description || "",
            date: expense.date
                ? new Date(expense.date).toISOString().split("T")[0]
                : ""
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        try {
            await API.delete(`/expenses/item/${expenseId}`, config);
            showMessage("Expense deleted successfully!", "success");
            await fetchData();
        } catch (error) {
            showMessage(
                error.response?.data?.message || "Unable to delete expense",
                "error"
            );
        }
    };

    if (loading) {
        return <div className="budget-loading">Loading budget...</div>;
    }

    const percentage = data.budget > 0
        ? Math.round((data.totalSpent / data.budget) * 100)
        : 0;

    return (
        <div className="budget-page">

            <header className="budget-header">
                <Link to={`/event/${id}`} className="budget-back">
                    ← Back to Event
                </Link>

                <h1>Budget & Expenses</h1>
                <p>Plan your spending and keep every expense organized.</p>
            </header>

            {message && (
                <div className={`budget-message ${messageType}`}>
                    {message}
                    <button onClick={() => setMessage("")}>×</button>
                </div>
            )}

            <div className="budget-summary">
                <div className="budget-card">
                    <span>Total Budget</span>
                    <h2>₹{Number(data.budget).toLocaleString("en-IN")}</h2>
                    <p>Your planned event budget</p>
                </div>

                <div className="budget-card">
                    <span>Total Spent</span>
                    <h2>₹{Number(data.totalSpent).toLocaleString("en-IN")}</h2>
                    <p>Your recorded expenses</p>
                </div>

                <div className="budget-card">
                    <span>Remaining Budget</span>
                    <h2 className={data.remaining < 0 ? "over-budget" : ""}>
                        ₹{Number(data.remaining).toLocaleString("en-IN")}
                    </h2>
                    <p>{data.remaining < 0 ? "Over budget" : "Available amount"}</p>
                </div>
            </div>

            <section className="budget-progress">
                <div className="progress-heading">
                    <h3>Budget Overview</h3>
                    <strong>{percentage}% used</strong>
                </div>

                <div className="progress-track">
                    <div
                        className={`progress-fill ${percentage > 100 ? "over" : ""}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>

                <p>
                    ₹{Number(data.totalSpent).toLocaleString("en-IN")} spent out of
                    ₹{Number(data.budget).toLocaleString("en-IN")}
                </p>
            </section>

            {canManage && (
                <section className="budget-section">
                    <h2>Set Event Budget</h2>

                    <form onSubmit={saveBudget} className="budget-form">
                        <input
                            type="number"
                            min="0"
                            placeholder="Enter total budget"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            required
                        />

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Budget"}
                        </button>
                    </form>
                </section>
            )}

            {canManage && (
                <section className="budget-section">
                    <h2>{editingId ? "Edit Expense" : "Add New Expense"}</h2>

                    <form onSubmit={saveExpense} className="expense-form">
                        <input
                            name="title"
                            placeholder="Expense title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Amount (₹)"
                            value={form.amount}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                        >
                            {[
                                "Venue", "Food", "Decoration", "Clothing",
                                "Photography", "Transportation",
                                "Entertainment", "Other"
                            ].map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>

                        <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="description"
                            placeholder="Description (optional)"
                            value={form.description}
                            onChange={handleChange}
                        />

                        <div className="expense-form-buttons">
                            <button type="submit" disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Expense"
                                    : "Add Expense"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            )}

            <section className="budget-section">
                <div className="expense-heading">
                    <div>
                        <h2>Expense History</h2>
                        <p>All expenses recorded for this event.</p>
                    </div>
                    <span>{data.expenses.length} Expenses</span>
                </div>

                {data.expenses.length === 0 ? (
                    <div className="no-expenses">
                        <h3>No expenses yet</h3>
                        <p>Expenses will appear here once they are added.</p>
                    </div>
                ) : (
                    <div className="expense-list">
                        {data.expenses.map(expense => (
                            <div className="expense-card" key={expense._id}>
                                <div className="expense-info">
                                    <span className="expense-category">
                                        {expense.category}
                                    </span>

                                    <h3>{expense.title}</h3>
                                    <p>{expense.description || "No description"}</p>

                                    <small>
                                        {new Date(expense.date).toLocaleDateString("en-IN")}
                                        {" · "}
                                        Added by {expense.createdBy?.name || "Member"}
                                    </small>
                                </div>

                                <div className="expense-right">
                                    <strong>
                                        ₹{Number(expense.amount).toLocaleString("en-IN")}
                                    </strong>

                                    {canManage && (
                                        <div className="expense-actions">
                                            <button onClick={() => editExpense(expense)}>
                                                Edit
                                            </button>

                                            <button
                                                className="delete-expense"
                                                onClick={() => deleteExpense(expense._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default EventBudget;
