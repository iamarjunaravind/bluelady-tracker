import axios from "axios";

// REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS
const API_URL = "http://192.168.1.12:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
