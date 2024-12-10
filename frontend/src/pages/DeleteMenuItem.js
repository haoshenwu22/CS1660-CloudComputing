import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const DeleteMenuItem = () => {
    const [menu, setMenu] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

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

    const handleDelete = async (menuId, imageUrl) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) {
            return; // Exit if the user cancels
        }
        console.log("Deleting menu item with ID:", menuId); // Debugging line

        try {
            // Delete the menu item from Firestore
            await api.delete(`/menu/${menuId}`);
            console.log("Good")
            // Delete image from gcp storage bucket 
            if (imageUrl) {
                const fileName = imageUrl.split("/").pop(); // Extract file name from URL
                await api.delete(`/delete-image/${fileName}`);
            }
            // console.log("Good")
            // Remove the item from the state to refresh the UI
            setMenu((prevMenu) => prevMenu.filter((item) => !item[menuId]));

            setMessage("Menu item deleted successfully!");
        } catch (err) {
            console.error("Error deleting menu item:", err);
            setError("Failed to delete menu item. Please try again.");
        }
    };

    return (
        <div>
            <nav>
                <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "blue" }}>
                    &larr; Back to Dashboard
                </Link>
            </nav>
            <h1>Delete Menu Item</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
            {menu.length === 0 ? (
                <p>No menu items available.</p>
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
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <strong>{value.name}</strong> - ${value.price.toFixed(2)}
                                    <p>{value.description}</p>
                                </div>
                                <button
                                    style={{
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleDelete(key, value.image_url)}
                                >
                                    Delete
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default DeleteMenuItem;
