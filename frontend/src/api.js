import axios from "axios";

const api = axios.create({
    baseURL: "https://us-central1-endless-bounty-433922-g4.cloudfunctions.net/restaurant-api", // Replace with your backend URL if needed
});

export default api;
