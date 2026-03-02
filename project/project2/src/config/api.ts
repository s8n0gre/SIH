export const API_BASE_URL = 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  REPORTS: {
    GET_ALL: `${API_BASE_URL}/reports`,
    CREATE: `${API_BASE_URL}/reports`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/reports/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/reports/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/reports/${id}`,
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE: `${API_BASE_URL}/users/profile`,
  }
};

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};