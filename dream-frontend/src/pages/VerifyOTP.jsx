import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyOTP, resendOTP, setAuthToken, getToken } from "../api";

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
    console.log("🔍 VerifyOTP mounted, email:", email, "type:", type);
    if (!email) {
      console.log("⚠️ No email in URL, redirecting to register");
      navigate("/register", { replace: true });
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
        console.log("✅ OTP verification successful, storing token...");
        setAuthToken(response.data.access_token, true); // Always remember (store in localStorage)
        
        // Verify token was stored
        const storedToken = getToken();
        console.log("🔍 Token stored after OTP:", storedToken ? "Yes" : "No");
        console.log("🔍 Token value:", storedToken ? storedToken.substring(0, 30) + "..." : "None");
        
        if (!storedToken) {
          setError("Failed to store authentication token. Please try logging in manually.");
          setLoading(false);
          return;
        }
        
        // Double-check token is in localStorage
        const localStorageToken = localStorage.getItem("token");
        console.log("🔍 Token in localStorage:", localStorageToken ? "Yes" : "No");
        
        setSuccess("Email verified successfully! Redirecting...");
        // Use window.location for a full page reload to ensure token is properly initialized
        setTimeout(() => {
          console.log("🔄 Navigating to home page...");
          window.location.href = "/";
        }, 1500);
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
      console.log("📧 Resending OTP to:", email);
      const response = await resendOTP(email);
      console.log("✅ Resend OTP response:", response);
      setSuccess(response.data.message || "A new verification code has been sent to your email.");
      setLoading(false);
    } catch (err) {
      console.error("❌ Resend OTP error:", err);
      setError(err.response?.data?.detail || "Failed to resend code. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Verify Your Email</h2>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        We've sent a verification code to <strong>{email}</strong>
        <br />
        <span style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "0.5rem", display: "block" }}>
          📧 Don't see it? Check your spam/junk folder!
        </span>
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
            textDecoration: "underline",
            cursor: loading ? "not-allowed" : "pointer",
            padding: 0,
            fontSize: "inherit",
          }}
        >
          {loading ? "Sending..." : "Resend code"}
        </button>
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

