import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../api";

const TablePage = () => {
    const { table_id } = useParams(); // Get the table ID from the URL
    const [menu, setMenu] = useState([]); // State for menu items
    const [order, setOrder] = useState([]); // State for the current order
    const [error, setError] = useState(null); // State for handling errors
    const [successMessage, setSuccessMessage] = useState(null); // State for order success message

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get("/menu");
    
                // Filter menu items based on availability
                const availableMenu = response.data.menu.filter((item) => {
                    const [, value] = Object.entries(item)[0]; // Extract the value object
                    return value.availability === true; // Check availability
                });
    
                setMenu(availableMenu); // Save only available menu items to state
            } catch (err) {
                console.error("Error fetching menu:", err);
                setError("Failed to load menu. Please try again later.");
            }
        };
    
        fetchMenu();
    }, []);
    

    const addToOrder = (itemName, quantity) => {
        setOrder((prevOrder) => {
            const existingItem = prevOrder.find((item) => item.name === itemName);
            if (existingItem) {
                return prevOrder.map((item) =>
                    item.name === itemName ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                return [...prevOrder, { name: itemName, quantity }];
            }
        });
    };

    const updateOrderQuantity = (itemName, newQuantity) => {
        if (newQuantity <= 0) {
            deleteOrderItem(itemName); // Remove item if quantity is 0 or less
        } else {
            setOrder((prevOrder) =>
                prevOrder.map((item) =>
                    item.name === itemName ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const deleteOrderItem = (itemName) => {
        setOrder((prevOrder) => prevOrder.filter((item) => item.name !== itemName));
    };

    const placeOrder = async () => {
        try {
            const payload = { table_id, items: order };
            await api.post("/order", payload);
            setSuccessMessage("Order placed successfully!");
            setOrder([]); // Clear the order
        } catch (err) {
            console.error("Error placing order:", err);
            setError("Failed to place order. Please try again.");
        }
    };

    // # I move this part to another endpoint 
    // const trackOrders = async () => {
    //     try {
    //         const response = await api.get(`/order-status/${table_id}`);
    //         setOrders(response.data.orders);
    //         setTrackingError(null);
    //         setHasTrackedOrders(true); // Mark that orders have been tracked
    //     } catch (err) {
    //         console.error("Error tracking orders:", err);
    //         setTrackingError("Failed to fetch orders. Please try again.");
    //         setHasTrackedOrders(true); // Still mark as tracked, even if it failed
    //     }
    // };
    return (
        <div>
            <h1>Welcome to Table {table_id}</h1>
            <div>
                {/* <h2>Navigation</h2> */}
                <Link to={`/table/${table_id}/track-orders`} style={{ textDecoration: "none", color: "blue" }}>
                    Track Orders
                </Link> |{" "}
                <Link to={`/table/${table_id}/checkout`} style={{ textDecoration: "none", color: "blue" }}>
                    Checkout
                </Link>
            </div>
            <h2>Menu</h2>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : menu.length === 0 ? (
                <p style={{ color: "blue" }}>No items available in the menu.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {menu.map((item, index) => {
                        const [key, value] = Object.entries(item)[0];
                        return (
                            <li key={index} style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
                                <img
                                    src={value.image_url}
                                    alt={value.name}
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        marginRight: "20px",
                                        borderRadius: "8px",
                                    }}
                                />
                                <div>
                                    <strong>{value.name}</strong> - ${value.price.toFixed(2)}
                                    <p>{value.description}</p>
                                    <div>
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue="1"
                                            id={`quantity-${key}`}
                                            style={{ width: "50px", marginRight: "10px" }}
                                        />
                                        <button
                                            onClick={() =>
                                                addToOrder(
                                                    value.name,
                                                    parseInt(document.getElementById(`quantity-${key}`).value)
                                                )
                                            }
                                        >
                                            Add to Order
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}


            <h2>Current Order</h2>
            {order.length === 0 ? (
                <p>No items in the order.</p>
            ) : (
                <ul>
                    {order.map((item, index) => (
                        <li key={index}>
                            {item.name} - Quantity:{" "}
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateOrderQuantity(item.name, parseInt(e.target.value))}
                                style={{ width: "50px", marginRight: "10px" }}
                            />
                            <button onClick={() => deleteOrderItem(item.name)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={placeOrder} disabled={order.length === 0}>
                Place Order
            </button>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            {/* <h2>Track Orders</h2>
            <button onClick={trackOrders}>Track Orders</button>
            {trackingError && <p style={{ color: "red" }}>{trackingError}</p>}
            {hasTrackedOrders && orders.length === 0 && !trackingError && (
                <p style={{ color: "blue" }}>No orders have been placed for this table yet.</p>
            )}
            {orders.length > 0 && (
                <div>
                    <h3>Order Details</h3>
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
                </div>
            )} */}
        </div>
    );
};

export default TablePage;
