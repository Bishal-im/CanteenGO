import axios from 'axios';
import { supabase } from './supabase';

// Use the environment variable for the API URL; default to localhost for development
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log("[API] Base URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
