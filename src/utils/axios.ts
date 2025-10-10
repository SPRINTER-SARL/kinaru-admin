import axios from "axios";

const VITE_FIREBASE_FUCNTIONS_URL =
  process.env.NEXT_PUBLIC_VITE_FIREBASE_FUCNTIONS_URL;

console.log("VITE_FIREBASE_FUCNTIONS_URL", VITE_FIREBASE_FUCNTIONS_URL);

const axiosInstance = axios.create({
  baseURL: VITE_FIREBASE_FUCNTIONS_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
