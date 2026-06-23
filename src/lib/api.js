import { get } from 'svelte/store';
import { logout } from './stores/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
    console.error("VITE_API_BASE_URL is not set in .env");
}

export async function apiFetch(endpoint, options = {}) {
  // Generate / Get Fingerprint Hash
  let fpHash = localStorage.getItem('fp_hash');
  if (!fpHash) {
    fpHash = "pending_fp"; 
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Fingerprint': fpHash,
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  // Token is now handled via HttpOnly Cookie automatically by the browser
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // X-New-Token is no longer needed since Set-Cookie handles sliding sessions

    // Baca body sekali saja sebagai teks, lalu coba parse sebagai JSON
    const rawText = await response.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch (_) {
      // Backend mengembalikan plain text (bukan JSON), gunakan sebagai pesan error
      data = { error: rawText.trim() || 'Server error' };
    }

    if (response.status === 401) {
      logout();
      // Jangan redirect jika sedang di halaman login agar pesan error tampil di UI
      if (endpoint !== '/login' && endpoint !== '/register') {
        window.location.href = '/?login=true';
      }
      throw new Error(data.error || data.message || 'Email atau password salah');
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}
