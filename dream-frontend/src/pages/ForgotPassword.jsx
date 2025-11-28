import { useState } from "react";
import { forgotPassword, verifyResetOTP, resetPassword } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSendOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.data.otp_sent) {
        setMessage("Verification code sent to your email. Please check your inbox.");
        setStep(2);
      } else {
        setError(res.data.message || "Failed to send verification code");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await verifyResetOTP(email, otpCode);
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token);
        setMessage("Verification code verified! Please enter your new password.");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      
      {/* Step 1: Enter Email */}
      {step === 1 && (
        <form onSubmit={handleSendOTP}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
          />

          {error && <p className="error-text">{error}</p>}
          {message && <p style={{ color: "#10b981" }}>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP}>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            We've sent a verification code to <strong>{email}</strong>
          </p>
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
          {message && <p style={{ color: "#10b981" }}>{message}</p>}

          <button type="submit" disabled={loading || otpCode.length !== 6}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{ marginTop: "10px", background: "transparent", color: "#6b7280" }}
          >
            ← Back to email
          </button>
        </form>
      )}

      {/* Step 3: Enter New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
          />

          {error && <p className="error-text">{error}</p>}
          {message && <p style={{ color: "#10b981" }}>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <p style={{ marginTop: "20px" }}>
        Remember your password? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

