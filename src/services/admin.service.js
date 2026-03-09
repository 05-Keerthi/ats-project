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

export const adminService = {
  // Get platform KPIs
  getKPIs: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/kpis/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // List all users
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/users/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
