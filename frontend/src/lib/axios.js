import axios from "axios";

const BASE_URL = import.meta.env.MODE === "production" ? "http://localhost:5001/api/v1":"/api/v1"

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})