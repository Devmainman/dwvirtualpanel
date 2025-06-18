import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // Add timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enhanced request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config}, error => {
  return Promise.reject(error);
});

// Update your interceptors to handle validation errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 400 && error.response.data?.errors) {
      // Handle validation errors
      const firstError = error.response.data.errors[0];
      return Promise.reject({
        message: firstError.msg,
        validation: true
      });
    }
    return Promise.reject(error);
  }
);

export default api;