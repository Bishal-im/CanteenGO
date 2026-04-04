import axios from 'axios';
import { supabase } from './supabase';

// Replace with your local IP address for physical devices (found: 192.168.18.240)
const API_URL = 'http://192.168.18.240:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
