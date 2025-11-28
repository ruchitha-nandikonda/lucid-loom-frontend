import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Debug logging to help diagnose API URL issues
console.log("🔍 API Configuration:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_URL: API_URL,
  isProduction: import.meta.env.PROD,
});

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
    console.log("🔐 setAuthToken called with token:", token.substring(0, 30) + "...", "remember:", remember);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (remember) {
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
      console.log("✅ Token stored in localStorage");
    } else {
      sessionStorage.setItem("token", token);
      console.log("✅ Token stored in sessionStorage");
    }
    // Verify it was stored
    const verifyToken = getToken();
    console.log("🔍 Verification - token retrievable:", verifyToken ? "Yes" : "No");
  } else {
    console.log("🔐 setAuthToken called with null - clearing tokens");
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
      console.log("⚠️ 401 Unauthorized - checking token...");
      const currentToken = getToken();
      console.log("🔍 Current token:", currentToken ? "Exists" : "Missing");
      console.log("🔍 Request URL:", error.config?.url);
      console.log("🔍 Current pathname:", window.location.pathname);
      
      // Only clear token and redirect if we're not on auth pages
      // This prevents clearing token during login/register attempts
      const isAuthPage = window.location.pathname === "/login" || 
                        window.location.pathname === "/register" || 
                        window.location.pathname === "/verify-otp" ||
                        window.location.pathname === "/forgot-password" ||
                        window.location.pathname === "/reset-password";
      
      // Also don't clear token if we just verified OTP (might be a race condition)
      // Check if the failed request was to a protected endpoint
      const isProtectedEndpoint = error.config?.url?.includes("/dreams") || 
                                  error.config?.url?.includes("/analytics") ||
                                  error.config?.url?.includes("/settings");
      
      if (!isAuthPage && isProtectedEndpoint) {
        console.log("⚠️ 401 on protected endpoint, clearing token and redirecting to login");
        setAuthToken(null);
        // Use window.location.href for full page reload to clear any state
        window.location.href = "/login";
      } else if (!isAuthPage) {
        console.log("⚠️ 401 but not on protected endpoint, might be a race condition - not clearing token");
      } else {
        console.log("ℹ️ On auth page, not clearing token or redirecting");
      }
    }
    // Don't redirect on other errors - let components handle them
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
export function registerUser(email, password, firstName, lastName) {
  return api.post("/auth/register", { 
    email, 
    password, 
    first_name: firstName, 
    last_name: lastName 
  });
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

export function verifyResetOTP(email, otpCode) {
  return api.post("/auth/verify-reset-otp", { email, otp_code: otpCode });
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

// User settings
export function getUserInfo() {
  return api.get("/user/info");
}

export function getUserStats() {
  return api.get("/user/stats");
}

export function exportUserData() {
  return api.get("/user/export");
}

export function deleteAccount(password) {
  return api.delete("/user/account", {
    data: { password },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default api;

