import axios from 'axios';

// Base URL of our backend API
const BASE_URL = 'https://bookease-backend.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,  // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─────────────────────────────────────────
// INTERCEPTORS: Runs on every request/response
// ─────────────────────────────────────────

// Request interceptor (runs before every API call)
api.interceptors.request.use(
  (config) => {
    // You can add auth token here later
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (runs after every API response)
api.interceptors.response.use(
  (response) => response.data,  // Return just the data part
  (error) => {
    // Extract error message from backend response
    const message = error.response?.data?.message
      || error.message
      || 'Something went wrong';
    
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────
// BOOK API FUNCTIONS
// ─────────────────────────────────────────
export const bookAPI = {
  // Get all books with optional filters
  getAll: (params = {}) => api.get('/books', { params }),
  
  // Get single book by MongoDB ID
  getById: (id) => api.get(`/books/${id}`),
  
  // Get book by custom book code
  getByCode: (bookId) => api.get(`/books/code/${bookId}`),
  
  // Get all categories
  getCategories: () => api.get('/books/categories'),
  
  // Add new book (admin)
  create: (bookData) => api.post('/books', bookData),
  
  // Update book (admin)
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  
  // Delete book (admin)
  delete: (id) => api.delete(`/books/${id}`)
};

// ─────────────────────────────────────────
// STUDENT API FUNCTIONS
// ─────────────────────────────────────────
export const studentAPI = {
  // Get all students
  getAll: (params = {}) => api.get('/students', { params }),
  
  // Get student by roll number (includes issued books)
  getByRoll: (rollNumber) => api.get(`/students/roll/${rollNumber}`),
  
  // Get student's full history
  getHistory: (rollNumber) => api.get(`/students/roll/${rollNumber}/history`),
  
  // Register student (admin)
  register: (studentData) => api.post('/students', studentData),
  
  // Update student
  update: (id, data) => api.put(`/students/${id}`, data)
};

// ─────────────────────────────────────────
// ISSUE/RETURN API FUNCTIONS
// ─────────────────────────────────────────
export const issueAPI = {
  // Get all issues
  getAll: (params = {}) => api.get('/issues', { params }),
  
  // Get dashboard stats
  getStats: () => api.get('/issues/stats'),
  
  // Issue a book
  issue: (data) => api.post('/issues/issue', data),
  
  // Return a book
  return: (data) => api.post('/issues/return', data)
};

export default api;