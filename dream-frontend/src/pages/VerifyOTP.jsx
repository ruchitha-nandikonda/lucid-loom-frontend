import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyOTP, registerUser, setAuthToken } from "../api";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "signup";
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await verifyOTP(email, otpCode);
      console.log("Verification response:", response);

      // Set auth token and redirect to home
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        setSuccess("Email verified successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = "/"; // Force full reload to ensure auth state
        }, 1000);
      } else {
        setError("Verification failed - no token received");
        setLoading(false);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.detail || "Verification failed");
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // For resend, we need password - but we don't have it stored
      // So we'll just show a message to re-register
      setError("Please go back and register again to receive a new code.");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend code");
      setLoading(false);
    }
  }

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
        <Link
          to="/register"
          style={{
            color: "#6366f1",
            textDecoration: "underline",
          }}
        >
          Register again
        </Link>
      </p>
      <p style={{ marginTop: "10px", textAlign: "center" }}>
        <Link
          to="/login"
          style={{
            color: "#6b7280",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}

