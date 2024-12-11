import axios from "axios";

const api = axios.create({
    baseURL: "https://us-central1-endless-bounty-433922-g4.cloudfunctions.net/restaurant-api", 
});

export default api;
