import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // For navigation
import api from "../api";

const AddMenuItem = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [availability, setAvailability] = useState(true);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadImage = async () => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post("/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.image_url;
        } catch (err) {
            console.error("Error uploading image:", err);
            throw new Error("Failed to upload image. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = "";
            if (file) {
                imageUrl = await uploadImage(); // Upload the image and get its URL
            }

            const payload = {
                name,
                price: parseFloat(price),
                description,
                availability,
                image_url: imageUrl,
            };

            await api.post("/menu", payload); // Add the menu item
            setMessage("Menu item added successfully!");
            setName("");
            setPrice("");
            setDescription("");
            setAvailability(true);
            setFile(null);

            // Redirect to the admin dashboard
            setTimeout(() => navigate("/admin/dashboard"), 1500);
        } catch (err) {
            console.error("Error adding menu item:", err);
            setError("Failed to add menu item. Please try again.");
        }
    };

    return (
        <div>
            <nav>
                <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "blue" }}>
                    &larr; Back to Dashboard
                </Link>
            </nav>
            <h1>Add Menu Item</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Availability:</label>
                    <input
                        type="checkbox"
                        checked={availability}
                        onChange={(e) => setAvailability(e.target.checked)}
                    />
                </div>
                <div>
                    <label>Image:</label>
                    <input type="file" onChange={handleFileChange} />
                </div>
                <button type="submit">Add Item</button>
            </form>
        </div>
    );
};

export default AddMenuItem;
