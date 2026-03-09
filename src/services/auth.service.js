import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/users/login/`, {
        email,
        password
      });
      if (response.data.success && response.data.data) {
        const { access_token, refresh_token, role } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('role', role);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register/`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('role');
    }
  },

  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
