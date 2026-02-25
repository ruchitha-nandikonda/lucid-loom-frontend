import { useState } from "react";
import { registerUser, setAuthToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate names
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }
    
    setLoading(true);
    try {
      console.log("📝 Starting registration for:", email);
      const response = await registerUser(email, password, firstName.trim(), lastName.trim());
      console.log("✅ Registration response:", response);
      
      // Log in immediately (no OTP verification)
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        setSuccess("Account created! Redirecting...");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } else {
        setError("Registration response missing. Please try again.");
        setLoading(false);
      }
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
        setError("Email already registered. Please log in instead.");
        setLoading(false);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
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
        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="John"
        />

        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          placeholder="Doe"
        />

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
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
