// In Desktop Electron mode (file:// protocol), talk to local background server on 54321
const isDesktop = typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean(window.electronAPI?.isDesktop));
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDesktop ? "http://127.0.0.1:54321/api" : "http://localhost:5000/api");

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  ME: `${API_BASE_URL}/auth/me`,
};

export default API_BASE_URL;
