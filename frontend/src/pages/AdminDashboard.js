import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // For navigation
import api from "../api";

const AdminDashboard = () => {
    const [menu, setMenu] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get("/menu");
                setMenu(response.data.menu);
            } catch (err) {
                console.error("Error fetching menu:", err);
                setError("Failed to load menu items. Please try again later.");
            }
        };

        fetchMenu();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <nav>
                <Link to="/admin/add">Add Menu Item</Link> |{" "}
                <Link to="/admin/edit">Edit Menu Item</Link> |{" "}
                <Link to="/admin/delete">Delete Menu Item</Link> |{" "}
                <Link to="/admin/orders">Update Order</Link>
            </nav>
            <h2>Menu Items</h2>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {menu.map((item, index) => {
                        const [, value] = Object.entries(item)[0];
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
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AdminDashboard;
