import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const sendMessage = async (query, settings = {}) => {
  const response = await api.post('/api/chat', { 
    query,
    deep_rag: settings.deepRag || false,
    auto_summarize: settings.autoSummarize || false
  });
  return response.data;
};

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/api/analytics');
  return response.data;
};

export const getRecentQueries = async () => {
  const response = await api.get('/api/analytics/recent');
  return response.data;
};

export default api;
