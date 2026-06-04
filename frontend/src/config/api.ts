// src/config/api.ts
// Single source of truth for the backend URL.
// VITE_API_URL should be set to the bare origin, e.g. https://loan-default-predictor-q8ne.onrender.com
// The /api prefix is appended here so every component gets it automatically.
const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_URL = `${base.replace(/\/+$/, '')}/api`;
