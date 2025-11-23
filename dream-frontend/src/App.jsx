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

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setAuthToken(token);
      // Verify token is set in axios
      console.log("Token initialized:", token ? "Yes" : "No");
    } else {
      console.log("No token found in storage");
    }
    setInitialized(true);
  }, []);

  if (!initialized) return null;

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Landing page - no navbar */}
          <Route
            path="/"
            element={
              (() => {
                const token = getToken();
                if (token) {
                  return (
                    <>
                      <Navbar />
                      <div className="container">
                        <DreamList />
                      </div>
                    </>
                  );
                }
                return <LandingPage />;
              })()
            }
          />
          
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
