import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/accounts/users/login/', credentials),
  register: (userData) => api.post('/accounts/users/register/', userData),
  logout: () => api.post('/accounts/users/logout/'),
  getCurrentUser: () => api.get('/accounts/users/me/'),
};

// Survey API
export const surveyAPI = {
  list: () => api.get('/surveys/surveys/'),
  get: (id) => api.get(`/surveys/surveys/${id}/`),
  create: (data) => api.post('/surveys/surveys/', data),
  update: (id, data) => api.put(`/surveys/surveys/${id}/`, data),
  delete: (id) => api.delete(`/surveys/surveys/${id}/`),
  publish: (id) => api.post(`/surveys/surveys/${id}/publish/`),
  close: (id) => api.post(`/surveys/surveys/${id}/close/`),
  getMySurveys: () => api.get('/surveys/surveys/my_surveys/'),
  getAssigned: () => api.get('/surveys/surveys/assigned/'),
  getQuestions: (id) => api.get(`/surveys/surveys/${id}/questions/`),
};

// Question API
export const questionAPI = {
  list: (surveyId) => api.get('/surveys/questions/', { params: { survey: surveyId } }),
  create: (data) => api.post('/surveys/questions/', data),
  update: (id, data) => api.put(`/surveys/questions/${id}/`, data),
  delete: (id) => api.delete(`/surveys/questions/${id}/`),
};

// Section API
export const sectionAPI = {
  list: () => api.get('/accounts/sections/'),
  get: (id) => api.get(`/accounts/sections/${id}/`),
  create: (data) => api.post('/accounts/sections/', data),
  update: (id, data) => api.put(`/accounts/sections/${id}/`, data),
  delete: (id) => api.delete(`/accounts/sections/${id}/`),
  enroll: (id, studentId) => api.post(`/accounts/sections/${id}/enroll/`, { student_id: studentId }),
};

export default api;

