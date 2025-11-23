import { useState } from "react";
import { forgotPassword } from "../api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message);
      // In development, show token (remove in production!)
      if (res.data.token) {
        setMessage(
          `${res.data.message}\n\nReset token (dev only): ${res.data.token}\n\nUse this in the reset password page.`
        );
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}
        {message && (
          <p style={{ color: "#10b981", whiteSpace: "pre-line" }}>
            {message}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p>
        Remember your password? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

