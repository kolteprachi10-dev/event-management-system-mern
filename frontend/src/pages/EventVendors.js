
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api";
import "../styles/EventVendors.css";

function EventVendors() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const emptyForm = {
        name: "",
        category: "Other",
        contactPerson: "",
        email: "",
        phone: "",
        services: "",
        cost: "",
        amountPaid: "",
        bookingStatus: "Not Contacted"
    };

    const [data, setData] = useState({
        vendors: [],
        totalVendors: 0,
        booked: 0,
        contacted: 0,
        notContacted: 0,
        cancelled: 0,
        totalCost: 0,
        totalPaid: 0,
        remainingAmount: 0,
        canManageVendors: false
    });

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [deleteId, setDeleteId] = useState(null);

    const fetchVendors = async () => {
        try {
            const response = await API.get(`/vendors/${id}`, config);
            setData(response.data);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to load vendors."
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
        fetchVendors();
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
        setMessage("");

        const cost = Number(form.cost);
        const amountPaid = Number(form.amountPaid);

        if (form.cost === "" || form.amountPaid === "") {
            setMessage("Please enter both estimated cost and amount paid.");
            setMessageType("error");
            return;
        }

        if (
            !Number.isFinite(cost) ||
            !Number.isFinite(amountPaid) ||
            cost < 0 ||
            amountPaid < 0
        ) {
            setMessage("Please enter valid payment amounts.");
            setMessageType("error");
            return;
        }

        if (amountPaid > cost) {
            setMessage("Amount paid cannot be greater than estimated cost.");
            setMessageType("error");
            return;
        }

        const vendorData = {
            ...form,
            cost,
            amountPaid
        };

        setSaving(true);

        try {
            if (editingId) {
                await API.put(
                    `/vendors/item/${editingId}`,
                    vendorData,
                    config
                );
                setMessage("Vendor updated successfully.");
            } else {
                await API.post(
                    `/vendors/${id}`,
                    vendorData,
                    config
                );
                setMessage("Vendor added successfully.");
            }

            setMessageType("success");
            resetForm();
            await fetchVendors();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to save vendor."
            );
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = vendor => {
        setEditingId(vendor._id);

        setForm({
            name: vendor.name || "",
            category: vendor.category || "Other",
            contactPerson: vendor.contactPerson || "",
            email: vendor.email || "",
            phone: vendor.phone || "",
            services: vendor.services || "",
            cost: String(vendor.cost ?? 0),
            amountPaid: String(vendor.amountPaid ?? 0),
            bookingStatus: vendor.bookingStatus || "Not Contacted"
        });

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/vendors/item/${deleteId}`, config);
            setDeleteId(null);
            setMessage("Vendor deleted successfully.");
            setMessageType("success");
            await fetchVendors();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to delete vendor."
            );
            setMessageType("error");
            setDeleteId(null);
        }
    };

    const filteredVendors = data.vendors.filter(vendor => {
        const matchesSearch =
            vendor.name.toLowerCase().includes(search.toLowerCase()) ||
            vendor.category.toLowerCase().includes(search.toLowerCase()) ||
            (vendor.email || "").toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            categoryFilter === "All" ||
            vendor.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const money = amount =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    if (loading) {
        return <div className="vendor-loading">Loading vendors...</div>;
    }

    return (
        <div className="vendor-page">
            <header className="vendor-header">
                <Link to={`/event/${id}`} className="vendor-back">
                    ← Back to Event
                </Link>

                <span className="vendor-label">EVENT ORGANIZATION</span>
                <h1>Vendor Management</h1>
                <p>Organize your event vendors, bookings and payments.</p>
            </header>

            {message && (
                <div className={`vendor-message ${messageType}`}>
                    {message}
                    <button onClick={() => setMessage("")}>×</button>
                </div>
            )}

            <section className="vendor-summary">
                <div className="vendor-summary-card">
                    <span>Total Vendors</span>
                    <h2>{data.totalVendors}</h2>
                </div>
                <div className="vendor-summary-card">
                    <span>Booked</span>
                    <h2>{data.booked}</h2>
                </div>
                <div className="vendor-summary-card">
                    <span>Contacted</span>
                    <h2>{data.contacted}</h2>
                </div>
                <div className="vendor-summary-card">
                    <span>Not Contacted</span>
                    <h2>{data.notContacted}</h2>
                </div>
                <div className="vendor-summary-card">
                    <span>Cancelled</span>
                    <h2>{data.cancelled}</h2>
                </div>
            </section>

            <section className="vendor-finance">
                <div>
                    <span>Total Estimated Cost</span>
                    <h2>{money(data.totalCost)}</h2>
                </div>
                <div>
                    <span>Amount Paid</span>
                    <h2>{money(data.totalPaid)}</h2>
                </div>
                <div>
                    <span>Remaining Amount</span>
                    <h2>{money(data.remainingAmount)}</h2>
                </div>
            </section>

            <section className="vendor-section">
                <div className="vendor-section-heading">
                    <div>
                        <span className="vendor-label">SERVICE DIRECTORY</span>
                        <h2>All Vendors</h2>
                    </div>
                    <span>{filteredVendors.length} Vendors</span>
                </div>

                <div className="vendor-filters">
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option>Catering</option>
                        <option>Decoration</option>
                        <option>Photography</option>
                        <option>Venue</option>
                        <option>Music</option>
                        <option>Transportation</option>
                        <option>Clothing</option>
                        <option>Other</option>
                    </select>
                </div>

                {filteredVendors.length === 0 ? (
                    <div className="vendor-empty">
                        <h3>No vendors found</h3>
                        <p>
                            {search || categoryFilter !== "All"
                                ? "Try changing your search or category."
                                : "Add vendors to start organizing your event services."}
                        </p>
                    </div>
                ) : (
                    <div className="vendor-grid">
                        {filteredVendors.map(vendor => (
                            <div className="vendor-card" key={vendor._id}>
                                <div className="vendor-card-top">
                                    <span className="vendor-category">
                                        {vendor.category}
                                    </span>
                                    <span className={`vendor-booking ${vendor.bookingStatus.toLowerCase().replaceAll(" ", "-")}`}>
                                        {vendor.bookingStatus}
                                    </span>
                                </div>

                                <h3>{vendor.name}</h3>

                                {vendor.contactPerson && (
                                    <p>
                                        <strong>Contact:</strong> {vendor.contactPerson}
                                    </p>
                                )}

                                {vendor.phone && (
                                    <p>
                                        <strong>Phone:</strong> {vendor.phone}
                                    </p>
                                )}

                                {vendor.email && (
                                    <p>
                                        <strong>Email:</strong> {vendor.email}
                                    </p>
                                )}

                                {vendor.services && (
                                    <p>
                                        <strong>Services:</strong> {vendor.services}
                                    </p>
                                )}

                                <div className="vendor-payment">
                                    <div>
                                        <span>Estimated Cost</span>
                                        <strong>{money(vendor.cost)}</strong>
                                    </div>
                                    <div>
                                        <span>Paid</span>
                                        <strong>{money(vendor.amountPaid)}</strong>
                                    </div>
                                </div>

                                <div className="vendor-payment-status">
                                    Payment: <strong>{vendor.paymentStatus}</strong>
                                </div>

                                {data.canManageVendors && (
                                    <div className="vendor-card-actions">
                                        <button onClick={() => handleEdit(vendor)}>
                                            Edit Vendor
                                        </button>
                                        <button
                                            className="vendor-delete"
                                            onClick={() => setDeleteId(vendor._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {data.canManageVendors && (
                <section className="vendor-section vendor-form-section">
                    <span className="vendor-label">VENDOR DETAILS</span>
                    <h2>{editingId ? "Edit Vendor" : "Add New Vendor"}</h2>

                    <form onSubmit={handleSubmit} className="vendor-form">
                        <div className="vendor-input-group">
                            <label>Vendor / Business Name</label>
                            <input
                                name="name"
                                placeholder="Enter vendor or business name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="vendor-input-group">
                            <label>Service Category</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option>Catering</option>
                                <option>Decoration</option>
                                <option>Photography</option>
                                <option>Venue</option>
                                <option>Music</option>
                                <option>Transportation</option>
                                <option>Clothing</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="vendor-input-group">
                            <label>Contact Person</label>
                            <input
                                name="contactPerson"
                                placeholder="Enter contact person's name"
                                value={form.contactPerson}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="vendor-input-group">
                            <label>Phone Number</label>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="Enter vendor phone number"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="vendor-input-group">
                            <label>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Enter vendor email address"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="vendor-input-group">
                            <label>Services Provided</label>
                            <input
                                name="services"
                                placeholder="Describe the services offered"
                                value={form.services}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="vendor-input-group">
                            <label>Estimated Cost (₹)</label>
                            <input
                                name="cost"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter total vendor cost"
                                value={form.cost}
                                onChange={handleChange}
                                required
                            />
                            <small>Enter the total amount agreed with the vendor.</small>
                        </div>

                        <div className="vendor-input-group">
                            <label>Amount Paid (₹)</label>
                            <input
                                name="amountPaid"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter amount already paid"
                                value={form.amountPaid}
                                onChange={handleChange}
                                required
                            />
                            <small>Enter 0 if no payment has been made yet.</small>
                        </div>

                        <div className="vendor-input-group">
                            <label>Booking Status</label>
                            <select
                                name="bookingStatus"
                                value={form.bookingStatus}
                                onChange={handleChange}
                            >
                                <option>Not Contacted</option>
                                <option>Contacted</option>
                                <option>Booked</option>
                                <option>Cancelled</option>
                            </select>
                        </div>

                        <div className="vendor-form-buttons">
                            <button type="submit" disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Vendor"
                                        : "Add Vendor"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="vendor-cancel"
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
                <div className="vendor-modal-overlay">
                    <div className="vendor-delete-popup">
                        <h2>Delete Vendor?</h2>
                        <p>
                            Are you sure you want to remove this vendor from the event?
                        </p>
                        <div>
                            <button onClick={handleDelete}>
                                Yes, Delete
                            </button>
                            <button
                                className="vendor-cancel"
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

export default EventVendors;
