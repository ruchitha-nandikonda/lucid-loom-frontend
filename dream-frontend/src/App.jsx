import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, setAuthToken } from "./api";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import DreamList from "./pages/DreamList";
import NewDream from "./pages/NewDream";
import DreamDetail from "./pages/DreamDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import PatternAnalysis from "./pages/PatternAnalysis";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles.css";

function PrivateRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function HomeRoute() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check token immediately and also with a small delay to catch any race conditions
    const checkToken = () => {
      const foundToken = getToken();
      console.log("🔍 HomeRoute - Token check:", foundToken ? "Found" : "Not found");
      if (foundToken) {
        console.log("🔍 Token preview:", foundToken.substring(0, 30) + "...");
        setAuthToken(foundToken);
        setToken(foundToken);
      } else {
        // Double-check localStorage directly
        const localStorageToken = localStorage.getItem("token");
        console.log("🔍 HomeRoute - Direct localStorage check:", localStorageToken ? "Found" : "Not found");
        if (localStorageToken) {
          console.log("✅ Found token in localStorage, using it");
          setAuthToken(localStorageToken);
          setToken(localStorageToken);
        } else {
          setToken(null);
        }
      }
      setChecking(false);
    };
    
    // Check immediately
    checkToken();
    
    // Also check after a small delay to catch any race conditions
    const timer = setTimeout(checkToken, 100);
    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return null; // Or a loading spinner
  }

  if (token) {
    console.log("✅ HomeRoute: Showing DreamList (logged in)");
    return (
      <>
        <Navbar />
        <div className="container">
          <DreamList />
        </div>
      </>
    );
  }

  console.log("⚠️ HomeRoute: Showing LandingPage (not logged in)");
  return <LandingPage />;
}

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    console.log("🔍 App initialization - Token check:", token ? "Found" : "Not found");
    if (token) {
      setAuthToken(token);
      // Verify token is set in axios
      console.log("✅ Token initialized in axios");
      console.log("🔍 Token value:", token.substring(0, 20) + "...");
      // Double-check localStorage
      const localStorageToken = localStorage.getItem("token");
      console.log("🔍 Token in localStorage:", localStorageToken ? "Yes" : "No");
    } else {
      console.log("⚠️ No token found in storage");
      // Check both storages
      console.log("🔍 localStorage token:", localStorage.getItem("token") ? "Exists" : "Missing");
      console.log("🔍 sessionStorage token:", sessionStorage.getItem("token") ? "Exists" : "Missing");
      // Clear any stale axios headers
      setAuthToken(null);
    }
    setInitialized(true);
  }, []);

  if (!initialized) return null;

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Landing page - no navbar */}
          <Route path="/" element={<HomeRoute />} />
          
          {/* Auth pages - no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Protected routes - with navbar */}
          <Route
            path="/new"
            element={
              <>
                <Navbar />
                <div className="container">
                  <PrivateRoute>
                    <NewDream />
                  </PrivateRoute>
                </div>
              </>
            }
          />
          <Route
            path="/dreams/:id"
            element={
              <>
                <Navbar />
                <div className="container">
                  <PrivateRoute>
                    <DreamDetail />
                  </PrivateRoute>
                </div>
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <Navbar />
                <div className="container">
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                </div>
              </>
            }
          />
          <Route
            path="/analytics"
            element={
              <>
                <Navbar />
                <div className="container">
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                </div>
              </>
            }
          />
          <Route
            path="/patterns"
            element={
              <>
                <Navbar />
                <div className="container">
                  <PrivateRoute>
                    <PatternAnalysis />
                  </PrivateRoute>
                </div>
              </>
            }
          />
          </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
