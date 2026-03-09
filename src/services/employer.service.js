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

export const employerService = {
  // Get list of all jobs (filtered by employer on backend ideally)
  getJobs: async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/list/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get job details
  getJobDetails: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new job
  createJob: async (jobData) => {
    try {
      const response = await axios.post(`${API_URL}/jobs/create/`, jobData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update job (using PUT or PATCH)
  updateJob: async (id, jobData) => {
    try {
      // Image showed PUT and PATCH support, typically PUT is full update
      const response = await axios.put(`${API_URL}/jobs/update/${id}/`, jobData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Schedule an interview for a shortlisted candidate
  scheduleInterview: async (payload) => {
    try {
      const response = await axios.post(`${API_URL}/interviews/schedule/`, payload, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update the status of a candidate's application
  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/applications/update-status/${applicationId}/`,
        { status },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all applications for a specific job (employer view)
  getJobApplications: async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/applications/job/${jobId}/applications/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all interviews scheduled by this employer
  getScheduledInterviews: async () => {
    try {
      const response = await axios.get(`${API_URL}/interviews/employer/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete job
  deleteJob: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/jobs/delete/${id}/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
