import axios from "axios";

const API_URL = "https://bluelady-tracker-production-e9eb.up.railway.app/api";
// const API_URL = "http://192.168.1.12:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
