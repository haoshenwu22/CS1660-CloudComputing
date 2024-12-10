import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";

const Checkout = () => {
    const { table_id } = useParams(); // Get the table ID from the URL
    const [orders, setOrders] = useState([]); // State for fetched orders
    const [menu, setMenu] = useState([]); // State for menu items
    const [totalAmount, setTotalAmount] = useState(0); // State for total amount
    const [error, setError] = useState(null); // State for handling errors
    const navigate = useNavigate(); // To navigate back to the menu

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch orders for the table
                const ordersResponse = await api.get(`/order-status/${table_id}`);
                const fetchedOrders = ordersResponse.data.orders || []; // Fallback to empty array
                setOrders(fetchedOrders);
                console.log("Orders before deletion:", fetchedOrders);

                // Fetch menu data to reference prices
                const menuResponse = await api.get("/menu");
                const fetchedMenu = menuResponse.data.menu || []; // Fallback to empty array
                setMenu(fetchedMenu);


                // Calculate total amount dynamically
                let total = 0;
                fetchedOrders.forEach((order) => {
                    order.items.forEach((item) => {
                        // Find the item's price from the menu
                        const menuItem = fetchedMenu.find(
                            (menuItem) => Object.values(menuItem)[0]?.name === item.name
                        );
                        const price = menuItem ? Object.values(menuItem)[0]?.price : 0; // Default to 0 if not found
                        total += price * item.quantity;
                    });
                });
                setTotalAmount(total);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Please try again.");
            }
        };

        fetchData();
    }, [table_id]);

    const handleCheckout = async () => {
        try {
            console.log(orders)
            // Use Promise.all to wait for all delete requests to complete
            const deletePromises = orders.map((order) =>
                api.delete(`/delete-order/${order.order_id}`)
            );
            await Promise.all(deletePromises); // Wait for all deletions to complete
            
            // Set success message
            setError(null);
            
            // Redirect back to the menu only after all deletions
            navigate(`/table/${table_id}`);
        } catch (err) {
            console.error("Error during checkout:", err);
            setError("Failed to complete checkout. Please try again.");
        }
    };

    return (
        <div>
            <nav>
                <Link to={`/table/${table_id}`} style={{ textDecoration: "none", color: "blue" }}>
                    &larr; Back to Menu
                </Link>
            </nav>
            <h1>Checkout for Table {table_id}</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {orders.length === 0 ? (
                <p>No orders have been placed for this table yet.</p>
            ) : (
                <div>
                    <h2>Order Summary</h2>
                    <ul>
                        {orders.map((order, index) => (
                            <li key={index}>
                                <p>
                                    <strong>Status:</strong> {order.status}
                                </p>
                                <p>
                                    <strong>Timestamp:</strong> {order.timestamp}
                                </p>
                                <ul>
                                    {order.items.map((item, idx) => {
                                        // Find the item's price from the menu
                                        const menuItem = menu.find(
                                            (menuItem) => Object.values(menuItem)[0]?.name === item.name
                                        );
                                        const price = menuItem ? Object.values(menuItem)[0]?.price : 0;

                                        return (
                                            <li key={idx}>
                                                {item.name} - Quantity: {item.quantity} - Price: $
                                                {price.toFixed(2)}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
                    <button
                        onClick={handleCheckout}
                        style={{
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            cursor: "pointer",
                            borderRadius: "5px",
                        }}
                    >
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Checkout;
