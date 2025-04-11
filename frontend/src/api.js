import axios from 'axios';

const API = axios.create({
    baseURL: 'https://vms-be-bwb0.onrender.com/api', 
  });
  
// Add request interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  console.log('Request URL:', req.url);
  console.log('Auth token present:', !!token);
  
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor
API.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error('Response interceptor error:', error);
  
  // Handle 401 Unauthorized errors
  if (error.response && error.response.status === 401) {
    console.log('Unauthorized request - clearing auth tokens');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  return Promise.reject(error);
});

export default API;
