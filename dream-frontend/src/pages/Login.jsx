import { useEffect, useState } from "react";
import { loginUser, setAuthToken, getToken, getRememberedEmail, setRememberedEmail, clearRememberedEmail } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = getRememberedEmail();
    if (saved) setEmail(saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("📝 Starting login for:", normalizedEmail);
      
      const res = await loginUser(normalizedEmail, password);
      console.log("✅ Login successful, token received:", res.data.access_token ? "Yes" : "No");
      
      if (!res.data.access_token) {
        setError("Login failed - no token received from server");
        console.error("❌ No access token in response:", res.data);
        return;
      }
      
      // Store token
      setAuthToken(res.data.access_token, remember);
      console.log("💾 Token stored with remember:", remember);
      
      // Verify token was stored
      const storedToken = getToken();
      console.log("🔍 Token stored verification:", storedToken ? "Yes" : "No");
      console.log("🔍 Token value:", storedToken ? storedToken.substring(0, 20) + "..." : "None");
      
      if (!storedToken) {
        setError("Failed to store authentication token. Please try again.");
        console.error("❌ Token storage failed!");
        return;
      }
      
      if (remember) {
        setRememberedEmail(normalizedEmail);
        console.log("💾 Email remembered");
      } else {
        clearRememberedEmail();
      }
      
      console.log("✅ Login complete, navigating to home...");
      
      // Use replace: true to prevent back button issues
      // Small delay to ensure token is stored before navigation
      setTimeout(() => {
        console.log("🔗 Navigating to /");
        navigate("/", { replace: true });
      }, 200);
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      const apiMsg = err?.response?.data?.detail;
      setError(apiMsg || "Invalid email or password");
    }
  }

  return (
    <div className="auth-card">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          type="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="remember-me-container">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember">Remember me</label>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit">Log in</button>
      </form>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        No account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}

