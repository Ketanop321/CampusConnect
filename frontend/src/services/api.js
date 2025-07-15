//api.js is used to create a base axios instance with common configurations
// It is used to handle authentication and error handling


import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
//Isse ek custom axios instance banta hai
//Har request mein baseURL already added hota hai






// Add a request interceptor
//Har request se pehle, ye interceptor chalta hai.
//localStorage se access_token uthake Authorization header mein laga deta hai.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //headers ke andar Authorization key add karo with Bearer <token> value.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
// Agar 401 aaya to pehle check karega refresh_token
// Agar wo mil gaya to POST /auth/token/refresh/ pe token refresh karega
// Naya access token set karke automatically same request ko retry karega
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error status is 401 and we haven't already tried to refresh the token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (error) {
        // If refresh fails, redirect to login
        console.error('Failed to refresh token:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
