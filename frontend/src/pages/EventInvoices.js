
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api";
import "../styles/EventInvoices.css";

function EventInvoices() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const [data, setData] = useState({
        invoices: [],
        totalAmount: 0,
        totalPaid: 0,
        remainingAmount: 0,
        canManageFinance: false
    });

    const [form, setForm] = useState({
        title: "",
        amount: "",
        amountPaid: "0",
        dueDate: "",
        description: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [deleteId, setDeleteId] = useState(null);

    const fetchInvoices = async () => {
        try {
            const response = await API.get(`/invoices/${id}`, config);
            setData(response.data);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to load invoices."
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
        fetchInvoices();
    }, [id]);

    const handleChange = e => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm({
            title: "",
            amount: "",
            amountPaid: "0",
            dueDate: "",
            description: ""
        });
        setEditingId(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const invoiceData = {
                ...form,
                amount: Number(form.amount),
                amountPaid: Number(form.amountPaid)
            };

            if (editingId) {
                await API.put(
                    `/invoices/item/${editingId}`,
                    invoiceData,
                    config
                );
                setMessage("Invoice updated successfully.");
            } else {
                await API.post(`/invoices/${id}`, invoiceData, config);
                setMessage("Invoice created successfully.");
            }

            setMessageType("success");
            resetForm();
            await fetchInvoices();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to save invoice."
            );
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = invoice => {
        setEditingId(invoice._id);
        setForm({
            title: invoice.title || "",
            amount: String(invoice.amount),
            amountPaid: String(invoice.amountPaid),
            dueDate: invoice.dueDate
                ? new Date(invoice.dueDate).toISOString().split("T")[0]
                : "",
            description: invoice.description || ""
        });
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/invoices/item/${deleteId}`, config);
            setDeleteId(null);
            setMessage("Invoice deleted successfully.");
            setMessageType("success");
            await fetchInvoices();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to delete invoice."
            );
            setMessageType("error");
            setDeleteId(null);
        }
    };

    const formatAmount = amount =>
        Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });

    if (loading) {
        return <div className="invoice-loading">Loading invoices...</div>;
    }

    return (
        <div className="invoice-page">
            <header className="invoice-header">
                <Link to={`/event/${id}`} className="invoice-back">
                    ← Back to Event
                </Link>
                <span className="invoice-label">EVENT FINANCES</span>
                <h1>Invoice Management</h1>
                <p>Keep track of event payments and outstanding amounts.</p>
            </header>

            {message && (
                <div className={`invoice-message ${messageType}`}>
                    {message}
                    <button onClick={() => setMessage("")}>×</button>
                </div>
            )}

            <section className="invoice-summary">
                <div className="invoice-summary-card">
                    <span>Total Invoices</span>
                    <h2>{data.invoices.length}</h2>
                </div>
                <div className="invoice-summary-card">
                    <span>Total Amount</span>
                    <h2>{formatAmount(data.totalAmount)}</h2>
                </div>
                <div className="invoice-summary-card">
                    <span>Amount Paid</span>
                    <h2>{formatAmount(data.totalPaid)}</h2>
                </div>
                <div className="invoice-summary-card">
                    <span>Outstanding</span>
                    <h2>{formatAmount(data.remainingAmount)}</h2>
                </div>
            </section>

            <section className="invoice-section">
                <div className="invoice-section-heading">
                    <div>
                        <span className="invoice-label">PAYMENT RECORDS</span>
                        <h2>All Invoices</h2>
                    </div>
                    <span>{data.invoices.length} Records</span>
                </div>

                {data.invoices.length === 0 ? (
                    <div className="invoice-empty">
                        <h3>No invoices yet</h3>
                        <p>Invoices added for this event will appear here.</p>
                    </div>
                ) : (
                    <div className="invoice-list">
                        {data.invoices.map(invoice => (
                            <div className="invoice-card" key={invoice._id}>
                                <div className="invoice-card-main">
                                    <span className={`invoice-status ${invoice.status.toLowerCase().replace(" ", "-")}`}>
                                        {invoice.status}
                                    </span>
                                    <h3>{invoice.title}</h3>
                                    <p>{invoice.description || "No description"}</p>
                                    <small>
                                        Due date: {invoice.dueDate
                                            ? new Date(invoice.dueDate).toLocaleDateString()
                                            : "Not specified"}
                                    </small>
                                    <small>
                                        Created by: {invoice.createdBy?.name || "User"}
                                    </small>
                                </div>

                                <div className="invoice-card-right">
                                    <strong>{formatAmount(invoice.amount)}</strong>
                                    <span>Paid: {formatAmount(invoice.amountPaid)}</span>
                                    <span>
                                        Due: {formatAmount(invoice.amount - invoice.amountPaid)}
                                    </span>

                                    {data.canManageFinance && (
                                        <div className="invoice-actions">
                                            <button onClick={() => handleEdit(invoice)}>
                                                Edit
                                            </button>
                                            <button
                                                className="invoice-delete"
                                                onClick={() => setDeleteId(invoice._id)}
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

            {data.canManageFinance && (
                <section className="invoice-section invoice-form-section">
                    <span className="invoice-label">MANAGE PAYMENTS</span>
                    <h2>{editingId ? "Edit Invoice" : "Create New Invoice"}</h2>

                    <form onSubmit={handleSubmit} className="invoice-form">
                        <input
                            type="text"
                            name="title"
                            placeholder="Invoice title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            name="amount"
                            placeholder="Total amount (₹)"
                            value={form.amount}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />

                        <input
                            type="number"
                            name="amountPaid"
                            placeholder="Amount paid (₹)"
                            value={form.amountPaid}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />

                        <input
                            type="date"
                            name="dueDate"
                            value={form.dueDate}
                            onChange={handleChange}
                        />

                        <textarea
                            name="description"
                            placeholder="Invoice description"
                            value={form.description}
                            onChange={handleChange}
                        />

                        <div className="invoice-form-buttons">
                            <button type="submit" disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Invoice"
                                        : "Create Invoice"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="invoice-cancel"
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
                <div className="invoice-modal-overlay">
                    <div className="invoice-delete-popup">
                        <h2>Delete Invoice?</h2>
                        <p>Are you sure you want to permanently delete this invoice?</p>
                        <div>
                            <button onClick={handleDelete}>Yes, Delete</button>
                            <button
                                className="invoice-cancel"
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

export default EventInvoices;
