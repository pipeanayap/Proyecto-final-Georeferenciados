import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const reportsApi = {
  create: (formData) =>
    api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMine: (params) => api.get('/reports/mine', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  addComment: (id, text) => api.post(`/reports/${id}/comments`, { text }),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const adminApi = {
  getReports: (params) => api.get('/admin/reports', { params }),
  getReportById: (id) => api.get(`/admin/reports/${id}`),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getStats: () => api.get('/admin/reports/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

export default api;
