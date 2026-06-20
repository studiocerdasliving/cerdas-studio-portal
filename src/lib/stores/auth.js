import { writable } from 'svelte/store';

// Ambil token dari localStorage jika ada
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

let initialUser = null;
try {
  initialUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
} catch(e) {
  console.error("Failed to parse user from localStorage", e);
  localStorage.removeItem('user');
}

export const token = writable(storedToken || null);
export const user = writable(initialUser);
export const isAuthenticated = writable(!!storedToken);

// Fungsi untuk login dan menyimpan token
export function login(newToken, userData) {
  localStorage.setItem('token', newToken);
  localStorage.setItem('user', JSON.stringify(userData));
  token.set(newToken);
  user.set(userData);
  isAuthenticated.set(true);
}

// Fungsi untuk update token saja (Sliding Session)
export function updateToken(newToken) {
  if (newToken) {
    localStorage.setItem('token', newToken);
    token.set(newToken);
  }
}

// Fungsi untuk logout
export async function logout() {
  const currentToken = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL is not set in .env");
  }

  if (currentToken) {
    try {
      // Panggil backend untuk memasukkan token ke daftar hitam (Blacklist)
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
    } catch (e) {
      console.error("Gagal blacklist token di server:", e);
    }
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  token.set(null);
  user.set(null);
  isAuthenticated.set(false);
}
