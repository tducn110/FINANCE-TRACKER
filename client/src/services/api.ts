import axios from 'axios';

// ✅ Sửa lại baseURL để nó tự động lấy từ .env hoặc fallback về localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ... (các đoạn request interceptor và service giữ nguyên bên dưới)
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

// ✅ Add response interceptor for better debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error Detail:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
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

export interface IFinanceService {
  getSafeToSpend: () => Promise<any>;
  getMascotStatus: () => Promise<any>;
  getTransactions: () => Promise<any>;
  getMonthlyTrend: () => Promise<any>;
  quickAddTransaction: (data: { amount: number; note: string; category_id: string; date?: string }) => Promise<any>;
  checkGoalImpact: (data: { simulate_expense: number }) => Promise<any>;
  getCategories: () => Promise<any>;
  uploadOCR: (file: File) => Promise<any>;
}

export const financeService: IFinanceService = {
  getSafeToSpend: async () => {
    const response = await api.get('/finance/safe-to-spend');
    return response.data;
  },
  getMascotStatus: async () => {
    const response = await api.get('/finance/mascot-status');
    return response.data;
  },
  getTransactions: async () => {
    const response = await api.get('/finance/transactions');
    return response.data;
  },
  getMonthlyTrend: async () => {
    const response = await api.get('/finance/trend');
    return response.data;
  },
  quickAddTransaction: async (data: { amount: number; note: string; category_id: string; date?: string }) => {
    const response = await api.post('/finance/transactions/quick', data);
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
