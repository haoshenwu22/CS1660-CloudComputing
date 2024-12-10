import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const EditMenuItem = () => {
    const [menu, setMenu] = useState([]); // Menu items
    const [selectedItem, setSelectedItem] = useState(null); // Currently selected item for editing
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        availability: true,
    }); // Editable fields
    const [file, setFile] = useState(null); // File for new image upload
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

    const handleEditClick = (item) => {
        setSelectedItem(item); // Set the selected item for editing
        const [key, value] = Object.entries(item)[0];
        setFormData({
            name: value.name,
            price: value.price,
            description: value.description,
            availability: value.availability,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = selectedItem.image_url;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await api.post("/upload-image", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                imageUrl = response.data.image_url; // Update image URL
            }

            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                availability: formData.availability,
                image_url: imageUrl,
            };

            const [key] = Object.keys(selectedItem);
            await api.put(`/menu/${key}`, payload); // Update Firestore

            setMessage("Menu item updated successfully!");
            setSelectedItem(null); // Return to list view
            setFile(null);
            // Re-fetch the menu to show the latest changes
            const response = await api.get("/menu");
            setMenu(response.data.menu);
        } catch (err) {
            console.error("Error updating menu item:", err);
            setError("Failed to update menu item. Please try again.");
        }
    };

    const handleCancel = () => {
        setSelectedItem(null); // Cancel editing and return to list view
        setFile(null);
    };

    return (
        <div>
            <nav>
                <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "blue" }}>
                    &larr; Back to Dashboard
                </Link>
            </nav>
            <h1>Edit Menu Item</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
            {selectedItem ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled
                        />
                    </div>
                    <div>
                        <label>Price:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Availability:</label>
                        <input
                            type="checkbox"
                            name="availability"
                            checked={formData.availability}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    availability: e.target.checked,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label>Change Image:</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>
                    <button type="submit">Update Item</button>
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                </form>
            ) : (
                <ul>
                    {menu.map((item, index) => {
                        const [key, value] = Object.entries(item)[0];
                        return (
                            <li key={index}>
                                <img
                                    src={value.image_url}
                                    alt={value.name}
                                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                />
                                <strong>{value.name}</strong> - ${value.price.toFixed(2)}
                                <button onClick={() => handleEditClick(item)}>Edit</button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default EditMenuItem;
