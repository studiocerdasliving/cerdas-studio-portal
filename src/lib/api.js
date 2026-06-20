import { get } from 'svelte/store';
import { token, logout } from './stores/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
    console.error("VITE_API_BASE_URL is not set in .env");
}

export async function apiFetch(endpoint, options = {}) {
  const currentToken = get(token);
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

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Tangkap token baru jika server memberikan Sliding Session
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      import('./stores/auth.js').then(module => {
        module.updateToken(newToken);
      });
    }

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
        window.location.href = '/login';
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
