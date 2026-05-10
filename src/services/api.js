import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log("Token being sent:", token); // add this
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;