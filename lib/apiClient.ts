import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pms-invoice-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token and active tenant/property context
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pms_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeOrgId = localStorage.getItem('pms_active_org_id');
    if (activeOrgId) {
      config.headers['x-organisation-id'] = activeOrgId;
    }

    const activePropId = localStorage.getItem('pms_active_property_id');
    if (activePropId) {
      config.headers['x-property-id'] = activePropId;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling 401 token expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isPublic = currentPath === '/' || currentPath === '/login' || currentPath.startsWith('/invoices/pay');
      if (!isPublic) {
        localStorage.removeItem('pms_access_token');
        localStorage.removeItem('pms_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
