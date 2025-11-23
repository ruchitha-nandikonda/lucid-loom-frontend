import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, setAuthToken } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
        <Navbar />
        <div className="container">
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <DreamList />
              </PrivateRoute>
            }
          />
          <Route
            path="/new"
            element={
              <PrivateRoute>
                <NewDream />
              </PrivateRoute>
            }
          />
          <Route
            path="/dreams/:id"
            element={
              <PrivateRoute>
                <DreamDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/patterns"
            element={
              <PrivateRoute>
                <PatternAnalysis />
              </PrivateRoute>
            }
          />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
