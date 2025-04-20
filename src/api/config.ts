
// Determine the API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    signup: `${API_BASE_URL}/auth/signup`,
    me: `${API_BASE_URL}/auth/me`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/dashboard/stats`,
    chartData: `${API_BASE_URL}/dashboard/chart-data`,
    attackSources: `${API_BASE_URL}/dashboard/attack-sources`,
  },
  alerts: {
    getAll: `${API_BASE_URL}/alerts`,
    getById: (id: string) => `${API_BASE_URL}/alerts/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/alerts/${id}/status`,
    create: `${API_BASE_URL}/alerts`,
  },
  actions: {
    blockIp: `${API_BASE_URL}/actions/block-ip`,
    unblockIp: `${API_BASE_URL}/actions/unblock-ip`,
    blockedIps: `${API_BASE_URL}/actions/blocked-ips`,
  },
  devices: {
    getAll: `${API_BASE_URL}/devices`,
  },
};

// HTTP request options
export const getRequestOptions = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return { headers };
};
