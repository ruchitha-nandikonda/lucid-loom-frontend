import { useState } from "react";
import { registerUser, verifyOTP } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("register"); // "register" or "verify"
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

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await verifyOTP(email, otpCode);
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await registerUser(email, password);
      setSuccess("Verification code resent to your email.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          We've sent a verification code to <strong>{email}</strong>
        </p>
        <form onSubmit={handleVerifyOTP}>
          <label>Verification Code</label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px" }}
          />

          {error && <p className="error-text">{error}</p>}
          {success && <p style={{ color: "#10b981", marginTop: "10px" }}>{success}</p>}

          <button type="submit" disabled={loading || otpCode.length !== 6}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              cursor: loading ? "not-allowed" : "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Resend
          </button>
        </p>
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setStep("register")}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              fontSize: "14px",
            }}
          >
            Change email
          </button>
        </p>
      </div>
    );
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
          {loading ? "Sending..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

