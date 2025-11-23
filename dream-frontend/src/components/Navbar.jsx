import { Link, useNavigate } from "react-router-dom";
import { getToken, setAuthToken } from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const token = getToken();

  function handleLogout() {
    setAuthToken(null);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Lucid Loom</Link>
      </div>
      <div className="nav-right">
        {token ? (
          <>
            <Link to="/">My Dreams</Link>
            <Link to="/new">New Dream</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/patterns">Patterns</Link>
            <Link to="/settings">Settings</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

