import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access-token-admin");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {

      const result = await Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      if (result.isConfirmed) {
        localStorage.removeItem("access-token-admin");
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);


export default api;