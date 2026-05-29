import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api' });

// Attach JWT automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
api.interceptors.response.use(
  r => r,
  err => {
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
};

export const tenantApi = {
  getMe: () => api.get('/tenants/me'),
  updateMe: (data) => api.put('/tenants/me', data),
  regenerateKey: () => api.post('/tenants/me/regenerate-key'),
  connectWhatsApp: () => api.post('/tenants/me/whatsapp/connect'),
  getWhatsAppStatus: () => api.get('/tenants/me/whatsapp/status'),
  disconnectWhatsApp: () => api.post('/tenants/me/whatsapp/disconnect'),
};

export const qnaApi = {
  getAll: () => api.get('/qna'),
  create: (data) => api.post('/qna', data),
  update: (id, data) => api.put(`/qna/${id}`, data),
  delete: (id) => api.delete(`/qna/${id}`),
  preview: (question) => api.post('/qna/preview', { question }),
};

export default api;
