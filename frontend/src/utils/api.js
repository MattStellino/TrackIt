const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request
        return retryRequest(response.url, response.method, response.body);
      }
    }
    
    // Throw error with response data
    const error = new Error(data.error || data.message || 'API request failed');
    error.response = response;
    error.data = data;
    throw error;
  }
  
  return data;
};

// Refresh token function
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  // Clear tokens and redirect to login
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/';
  return false;
};

// Retry request with new token
const retryRequest = async (url, method, body) => {
  const headers = getAuthHeaders();
  const options = { method, headers };
  
  if (body) {
    options.body = body;
  }

  const response = await fetch(url, options);
  return handleResponse(response);
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  const config = {
    headers,
    ...options
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Auth endpoints
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  refreshToken: () => apiCall('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ 
      refreshToken: localStorage.getItem('refreshToken') 
    })
  }),
  
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  
  getProfile: () => apiCall('/auth/profile'),
  
  updateProfile: (profileData) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  
  changePassword: (passwordData) => apiCall('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  }),
  
  forgotPassword: (email) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  
  resetPassword: (resetData) => apiCall('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(resetData)
  }),

  // Transaction endpoints
  getTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/transactions?${queryString}`);
  },
  
  getTransaction: (id) => apiCall(`/transactions/${id}`),
  
  createTransaction: (transactionData) => apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData)
  }),
  
  updateTransaction: (id, transactionData) => apiCall(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData)
  }),
  
  deleteTransaction: (id) => apiCall(`/transactions/${id}`, {
    method: 'DELETE'
  }),
  
  getTransactionStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/transactions/stats?${queryString}`);
  },
  
  getTransactionCategories: () => apiCall('/transactions/categories'),
  
  bulkDeleteTransactions: (transactionIds) => apiCall('/transactions/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ transactionIds })
  })
};

// Token management utilities
export const tokenUtils = {
  getToken: () => localStorage.getItem('token'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setTokens: (token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

export default api; 