import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies (JWT)
});

// Response Interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user needs to login again.
        // We handle dispatching logout in the thunk or components.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
