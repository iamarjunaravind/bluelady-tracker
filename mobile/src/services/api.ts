import axios from "axios";

// REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS
const API_URL = "https://bluelady-tracker-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
