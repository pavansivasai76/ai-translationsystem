/* API client for TranslateAI Pro backend */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// ── Translation ───────────────────────────────
export const translateAPI = {
    translate: (data) => api.post('/translate/', data),
    batch: (data) => api.post('/translate/batch', data),
    detect: (data) => api.post('/translate/detect', data),
    analyze: (data) => api.post('/translate/analyze', data),
};

// ── OCR ───────────────────────────────────────
export const ocrAPI = {
    extract: (formData) => api.post('/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    translate: (formData) => api.post('/ocr/translate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── PDF ───────────────────────────────────────
export const pdfAPI = {
    process: (formData) => api.post('/pdf/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Download ──────────────────────────────────
export const downloadAPI = {
    txt: (data) => api.post('/download/txt', data, { responseType: 'blob' }),
    docx: (data) => api.post('/download/docx', data, { responseType: 'blob' }),
    pdf: (data) => api.post('/download/pdf', data, { responseType: 'blob' }),
};

// ── History ───────────────────────────────────
export const historyAPI = {
    getAll: (params) => api.get('/history/', { params }),
    delete: (id) => api.delete(`/history/${id}`),
};

// ── Dashboard ─────────────────────────────────
export const dashboardAPI = {
    stats: () => api.get('/dashboard/stats'),
    analytics: () => api.get('/dashboard/analytics'),
};

// ── Chatbot ───────────────────────────────────
export const chatbotAPI = {
    send: (message) => api.post('/chatbot/message', { message }),
};

// ── Health ────────────────────────────────────
export const healthAPI = {
    check: () => api.get('/health'),
};

export default api;
