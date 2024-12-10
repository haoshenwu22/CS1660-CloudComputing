import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterTableId, setFilterTableId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [statusChanges, setStatusChanges] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get("/orders");
                const transformedOrders = response.data.orders.map((orderObj) => {
                    const [id, details] = Object.entries(orderObj)[0];
                    return { id, ...details };
                });
                setOrders(transformedOrders || []);
                setFilteredOrders(transformedOrders || []);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleFilter = () => {
        let filtered = [...orders];

        if (filterStatus) {
            filtered = filtered.filter((order) => order.status === filterStatus);
        }

        if (filterTableId) {
            filtered = filtered.filter((order) => order.table_id === filterTableId.trim());
        }

        setFilteredOrders(filtered);
    };

    const handleStatusUpdate = (orderId, newStatus) => {
        setStatusChanges((prevChanges) => ({
            ...prevChanges,
            [orderId]: newStatus,
        }));
    };

    const handleConfirmStatusChange = async () => {
        try {
            for (const [orderId, newStatus] of Object.entries(statusChanges)) {
                await api.put(`/order/${orderId}`, { status: newStatus });
            }

            setSuccessMessage("Order statuses updated successfully!");
            setError(null);

            await refreshOrders();
        } catch (err) {
            console.error("Error updating order status:", err);
            setError("Failed to update order statuses. Please try again.");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the order with ID: ${orderId}?`
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/delete-order/${orderId}`);
            setSuccessMessage("Order deleted successfully!");
            await refreshOrders();
        } catch (err) {
            console.error("Error deleting order:", err);
            setError("Failed to delete order. Please try again.");
        }
    };

    const refreshOrders = async () => {
        try {
            const response = await api.get("/orders");
            const transformedOrders = response.data.orders.map((orderObj) => {
                const [id, details] = Object.entries(orderObj)[0];
                return { id, ...details };
            });

            setOrders(transformedOrders || []);
            let updatedFilteredOrders = [...transformedOrders];

            if (filterStatus) {
                updatedFilteredOrders = updatedFilteredOrders.filter(
                    (order) => order.status === filterStatus
                );
            }

            if (filterTableId) {
                updatedFilteredOrders = updatedFilteredOrders.filter(
                    (order) => order.table_id === filterTableId.trim()
                );
            }

            setFilteredOrders(updatedFilteredOrders);
            setStatusChanges({});
        } catch (err) {
            console.error("Error refreshing orders:", err);
        }
    };

    if (loading) {
        return <p>Loading orders...</p>;
    }

    return (
        <div>
            <nav>
                <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "blue" }}>
                    &larr; Back to Dashboard
                </Link>
            </nav>
            <h1>Manage Orders</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            <div style={{ marginBottom: "20px" }}>
                <label>
                    Filter by Status:
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ marginLeft: "10px", marginRight: "20px" }}
                    >
                        <option value="">All</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </label>
                <label>
                    Filter by Table ID:
                    <input
                        type="text"
                        value={filterTableId}
                        onChange={(e) => setFilterTableId(e.target.value)}
                        placeholder="e.g., table1"
                        style={{ marginLeft: "10px", marginRight: "20px" }}
                    />
                </label>
                <button onClick={handleFilter}>Apply Filters</button>
            </div>

            {filteredOrders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Table ID</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                            <th>Actions</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order, index) => (
                            <tr key={index}>
                                <td>{order.id}</td>
                                <td>{order.table_id}</td>
                                <td>
                                    <ul>
                                        {order.items.map((item, idx) => (
                                            <li key={idx}>
                                                {item.name} - Quantity: {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>{order.status}</td>
                                <td>{new Date(order.timestamp).toLocaleString()}</td>
                                <td>
                                    <select
                                        value={statusChanges[order.id] || order.status}
                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        style={{
                                            backgroundColor: "red",
                                            color: "white",
                                            border: "none",
                                            padding: "5px 10px",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button
                onClick={handleConfirmStatusChange}
                style={{
                    marginTop: "20px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: "5px",
                }}
                disabled={Object.keys(statusChanges).length === 0}
            >
                Confirm Status Change
            </button>
        </div>
    );
};

export default ManageOrders;
