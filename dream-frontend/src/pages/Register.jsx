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
      console.log("📝 Starting registration for:", email);
      const response = await registerUser(email, password);
      console.log("✅ Registration response:", response);
      console.log("✅ Registration successful, navigating to verify-otp...");
      
      // Show success message
      setSuccess("Verification code sent! Redirecting...");
      
      // Small delay to show success message, then navigate
      setTimeout(() => {
        const verifyUrl = `/verify-otp?email=${encodeURIComponent(email)}&type=signup`;
        console.log("🔗 Navigating to:", verifyUrl);
        navigate(verifyUrl, { replace: true });
      }, 500);
    } catch (err) {
      console.error("❌ Registration error:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError("Request timed out. Please check your connection and try again.");
        setLoading(false);
      } else if (err.response?.status === 400 && err.response?.data?.detail?.includes("already registered")) {
        // User already exists but might not be verified
        setError("Email already registered. Please check your email for the verification code or try logging in.");
        // Still navigate to verify-otp in case they need to verify
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`, { replace: true });
        }, 2000);
        setLoading(false);
      } else if (err.response?.status === 403) {
        setError("Email verification required. Please check your email for the verification code.");
        // Still navigate to verify-otp even on 403 (user might have registered)
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`, { replace: true });
        }, 2000);
        setLoading(false);
      } else {
        const errorMsg = err.response?.data?.detail || err.message || "Registration failed";
        setError(errorMsg);
        setLoading(false);
      }
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

