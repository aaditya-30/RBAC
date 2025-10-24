import axios from 'axios';

// API Base URL - Remove trailing slash if exists
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

console.log('API Base URL:', API_BASE_URL); // For debugging

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Single /api here
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password, roles) => 
    api.post('/auth/signup', { name, email, password, roles }),
};

// Articles APIs
export const articlesAPI = {
  getAll: () => api.get('/articles'),
  create: (title, content) => api.post('/articles', { title, content }),
  delete: (id) => api.delete(`/articles/${id}`),
};

// User Management APIs
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Activity APIs
export const activityAPI = {
  getAll: () => api.get('/activity'),
  getMine: () => api.get('/activity/me'),
};

export default api;
