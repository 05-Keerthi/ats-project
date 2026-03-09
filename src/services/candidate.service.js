import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Also for multipart/form-data
const getMultipartHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  };
};

export const candidateService = {
  // Get list of all jobs 
  getJobs: async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/list/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Apply to a job using FormData (resume and job id)
  applyToJob: async (jobId, resumeFile) => {
    try {
      const formData = new FormData();
      formData.append('job', jobId);
      formData.append('resume', resumeFile);

      const response = await axios.post(`${API_URL}/applications/apply/`, formData, getMultipartHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get my applications
  getMyApplications: async () => {
    try {
      const response = await axios.get(`${API_URL}/applications/my-applications/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all scheduled interviews for the logged-in candidate
  getInterviews: async () => {
    try {
      const response = await axios.get(`${API_URL}/interviews/candidate/`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Select a preferred interview slot
  selectSlot: async (interviewId, selectedSlot) => {
    try {
      const response = await axios.put(`${API_URL}/interviews/select-slot/${interviewId}/`, {
        selected_slot: selectedSlot
      }, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
