import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

// Optional: Add response interceptor for common error handling
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors (e.g., 401 unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear local storage if token is invalid/expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
