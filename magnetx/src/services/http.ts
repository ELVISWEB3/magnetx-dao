import axios from 'axios';

// Determine the correct API base URL dynamically
const baseURL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (import.meta.env.MODE === 'production'
    ? 'https://magnetx.onrender.com/api'
    : 'http://localhost:3001');

// Create axios instance
const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Log environment for debugging
console.log('🔗 API Base URL:', baseURL);
console.log('🔍 Environment:', {
  MODE: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

// Add response interceptor for better error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('HTTP request error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default http;
