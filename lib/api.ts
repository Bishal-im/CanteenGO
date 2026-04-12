import axios from 'axios';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Use the environment variable for the API URL; fallback to localhost
let API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  API_URL = 'http://localhost:5001/api';
} else if (Platform.OS === 'web' && API_URL.includes('192.168.')) {
  // On web, sometimes it's better to try localhost if the IP is unreachable,
  // but for now we'll just log it.
  console.log("[API] Running on web with IP:", API_URL);
}

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
