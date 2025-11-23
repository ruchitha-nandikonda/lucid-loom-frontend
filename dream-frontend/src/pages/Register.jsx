import { useState } from "react";
import { registerUser, setAuthToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await registerUser(email, password);
      console.log("Registration response:", response);

      // Set auth token and redirect to home
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/"; // Force full reload to ensure auth state
        }, 1000);
      } else {
        setError("Registration failed - no token received");
        setLoading(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.detail || err.message || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Sign up</h2>
      <form onSubmit={handleRegister}>
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

        {error && <p className="error-text">{error}</p>}
        {success && <p style={{ color: "#10b981", marginTop: "10px" }}>{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

