import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

const TrackOrders = () => {
    const { table_id } = useParams(); // Get the table ID from the URL
    const [orders, setOrders] = useState([]); // State for fetched orders
    const [error, setError] = useState(null); // State for handling errors

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get(`/order-status/${table_id}`);
                setOrders(response.data.orders);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to fetch orders. Please try again.");
            }
        };

        fetchOrders();
    }, [table_id]);

    return (
        <div>
            <nav>
                <Link to={`/table/${table_id}`} style={{ textDecoration: "none", color: "blue" }}>
                    &larr; Back to Menu
                </Link>
            </nav>
            <h1>Track Orders for Table {table_id}</h1>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : orders.length === 0 ? (
                <p style={{ color: "blue" }}>No orders have been placed for this table yet.</p>
            ) : (
                <ul>
                    {orders.map((order, index) => (
                        <li key={index}>
                            <p>
                                <strong>Status:</strong> {order.status}
                            </p>
                            <p>
                                <strong>Timestamp:</strong> {order.timestamp}
                            </p>
                            <p>
                                <strong>Items:</strong>
                            </p>
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={idx}>
                                        {item.name} - Quantity: {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TrackOrders;
