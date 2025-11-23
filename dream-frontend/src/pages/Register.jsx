import { useState } from "react";
import { registerUser } from "../api";
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
      
      // Navigate to verify-otp page with email parameter
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`);
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
          {loading ? "Sending verification code..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

