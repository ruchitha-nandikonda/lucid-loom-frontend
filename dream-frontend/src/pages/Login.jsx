import { useEffect, useState } from "react";
import { loginUser, setAuthToken, getRememberedEmail, setRememberedEmail, clearRememberedEmail } from "../api";
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
      const res = await loginUser(normalizedEmail, password);
      setAuthToken(res.data.access_token, remember);
      if (remember) setRememberedEmail(normalizedEmail);
      else clearRememberedEmail();
      navigate("/");
    } catch (err) {
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

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0.25rem 0 0.75rem" }}>
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

