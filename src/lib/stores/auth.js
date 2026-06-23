import { writable } from 'svelte/store';

const storedUser = localStorage.getItem('user');

let initialUser = null;
try {
  initialUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
} catch(e) {
  console.error("Failed to parse user from localStorage", e);
  localStorage.removeItem('user');
}

export const token = writable(null); // Deprecated, kept for backward compatibility
export const user = writable(initialUser);
export const isAuthenticated = writable(!!initialUser);

// Fungsi untuk login dan menyimpan user
export function login(newToken, userData) {
  localStorage.setItem('user', JSON.stringify(userData));
  user.set(userData);
  isAuthenticated.set(true);
}

// Fungsi untuk update token saja (Sliding Session) - no longer needed with HttpOnly
export function updateToken(newToken) {
  // handled by browser Set-Cookie automatically
}

// Fungsi untuk logout
export async function logout() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL is not set in .env");
  }

  try {
    // Panggil backend untuk menghapus cookie dan blacklist token
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    console.error("Gagal logout di server:", e);
  }

  localStorage.removeItem('user');
  token.set(null);
  user.set(null);
  isAuthenticated.set(false);
}
