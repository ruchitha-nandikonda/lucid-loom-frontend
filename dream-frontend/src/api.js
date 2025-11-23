import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
});

// Helper functions (defined before interceptors)
function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function setAuthToken(token, remember = true) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (remember) {
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", token);
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }
}

// Export the functions
export { getToken, setAuthToken };

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Remembered email helpers
export function setRememberedEmail(email) {
  if (email) localStorage.setItem("rememberedEmail", email);
}
export function getRememberedEmail() {
  return localStorage.getItem("rememberedEmail") || "";
}
export function clearRememberedEmail() {
  localStorage.removeItem("rememberedEmail");
}

// Auth
export function registerUser(email, password) {
  return api.post("/auth/register", { email, password });
}

export function verifyOTP(email, otpCode, password = null) {
  const payload = { email, otp_code: otpCode };
  if (password) {
    payload.password = password;
  }
  return api.post("/auth/verify-otp", payload);
}

export function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  return api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

// Dreams
export function createDream(title, raw_text, generate_image = false) {
  return api.post("/dreams", { title, raw_text, generate_image });
}

export function fetchDreams() {
  return api.get("/dreams");
}

export function fetchDream(id) {
  return api.get(`/dreams/${id}`);
}

export function updateDream(id, title, raw_text) {
  return api.put(`/dreams/${id}`, { title, raw_text });
}

export function deleteDream(id) {
  return api.delete(`/dreams/${id}`);
}

export function regenerateDream(id) {
  return api.post(`/dreams/${id}/regenerate`);
}

export function rewriteDream(id, style) {
  return api.post(`/dreams/${id}/rewrite`, { style });
}

export function explainSymbol(symbol) {
  return api.get(`/symbols/${encodeURIComponent(symbol)}/explain`);
}

// Analytics
export function fetchAnalytics() {
  return api.get("/analytics/summary");
}

export function analyzePatterns() {
  return api.post("/analytics/patterns");
}

// Password management
export function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

export function resetPassword(token, newPassword) {
  return api.post("/auth/reset-password", { token, new_password: newPassword });
}

export function changePassword(currentPassword, newPassword) {
  return api.post("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

export default api;

