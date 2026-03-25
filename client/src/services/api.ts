import axios from 'axios';

// Create a generic Axios instance mapping to the backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject the JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};

export const financeService = {
  getSafeToSpend: async () => {
    const response = await api.get('/finance/safe-to-spend');
    return response.data;
  },
  getMascotStatus: async () => {
    const response = await api.get('/mascot/status');
    return response.data;
  },
  quickAddTransaction: async (data: { amount: number; note: string; category_id: number; date?: string }) => {
    const response = await api.post('/transactions/quick', data);
    return response.data;
  },
  checkGoalImpact: async (data: { simulate_expense: number }) => {
    const response = await api.post('/finance/check-impact', data);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  uploadOCR: async (file: File) => {
    const formData = new FormData();
    formData.append('billImage', file);
    const response = await api.post('/finance/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default api;
