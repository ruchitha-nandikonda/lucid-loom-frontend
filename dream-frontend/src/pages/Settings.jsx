import { useState, useEffect } from "react";
import { changePassword, getUserInfo, getUserStats, exportUserData, deleteAccount, getToken, setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [userInfo, setUserInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    setLoadingData(true);
    try {
      const [infoRes, statsRes] = await Promise.all([
        getUserInfo(),
        getUserStats(),
      ]);
      console.log("User info:", infoRes.data);
      console.log("User stats:", statsRes.data);
      setUserInfo(infoRes.data);
      setUserStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError("Failed to load account information. Please refresh the page.");
    } finally {
      setLoadingData(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportData() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await exportUserData();
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lucid-loom-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess("Dream data exported successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to export data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setError("Please enter your password to confirm");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteAccount(deletePassword);
      // Clear all tokens and storage
      setAuthToken(null);
      localStorage.clear();
      sessionStorage.clear();
      // Force full page reload to login page
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete account");
      setLoading(false);
    }
  }

  return (
    <div className="settings-page-creative">
      <div className="settings-container-creative">
        <h2 className="settings-title-creative">⚙️ Settings</h2>

        {/* Tabs */}
        <div className="settings-tabs-creative">
          <button
            className={`settings-tab-creative ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            👤 Account
          </button>
          <button
            className={`settings-tab-creative ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            🔒 Password
          </button>
          <button
            className={`settings-tab-creative ${activeTab === "data" ? "active" : ""}`}
            onClick={() => setActiveTab("data")}
          >
            📊 Data
          </button>
          <button
            className={`settings-tab-creative ${activeTab === "danger" ? "active" : ""}`}
            onClick={() => setActiveTab("danger")}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="settings-section-creative">
            <h3 className="section-title-creative">Account Information</h3>
            {loadingData ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>Loading account information...</p>
              </div>
            ) : userInfo ? (
              <>
                <div className="info-card-creative">
                  <div className="info-item-creative">
                    <span className="info-label-creative">👤 Username:</span>
                    <span className="info-value-creative">{userInfo.username || "Not set"}</span>
                  </div>
                  {userInfo.first_name && (
                    <div className="info-item-creative">
                      <span className="info-label-creative">📝 Name:</span>
                      <span className="info-value-creative">
                        {userInfo.first_name} {userInfo.last_name || ""}
                      </span>
                    </div>
                  )}
                  <div className="info-item-creative">
                    <span className="info-label-creative">📧 Email:</span>
                    <span className="info-value-creative">{userInfo.email}</span>
                  </div>
                  <div className="info-item-creative">
                    <span className="info-label-creative">✅ Email Verified:</span>
                    <span className="info-value-creative">
                      {userInfo.email_verified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="info-item-creative">
                    <span className="info-label-creative">🆔 User ID:</span>
                    <span className="info-value-creative">{userInfo.id}</span>
                  </div>
                </div>

                {userStats && (
                  <>
                    <h3 className="section-title-creative" style={{ marginTop: "2rem" }}>Account Statistics</h3>
                    <div className="stats-grid-creative">
                      <div className="stat-card-creative">
                        <span className="stat-icon-creative">💭</span>
                        <span className="stat-label-creative">Total Dreams</span>
                        <span className="stat-value-creative">{userStats.total_dreams}</span>
                      </div>
                      <div className="stat-card-creative">
                        <span className="stat-icon-creative">🖼️</span>
                        <span className="stat-label-creative">With Images</span>
                        <span className="stat-value-creative">{userStats.dreams_with_images}</span>
                      </div>
                      <div className="stat-card-creative">
                        <span className="stat-icon-creative">✨</span>
                        <span className="stat-label-creative">Interpreted</span>
                        <span className="stat-value-creative">{userStats.dreams_with_interpretation}</span>
                      </div>
                    </div>
                    {userStats.oldest_dream_date && (
                      <div className="info-card-creative" style={{ marginTop: "1.5rem" }}>
                        <div className="info-item-creative">
                          <span className="info-label-creative">📅 First Dream:</span>
                          <span className="info-value-creative">
                            {new Date(userStats.oldest_dream_date).toLocaleDateString()}
                          </span>
                        </div>
                        {userStats.newest_dream_date && (
                          <div className="info-item-creative">
                            <span className="info-label-creative">📅 Latest Dream:</span>
                            <span className="info-value-creative">
                              {new Date(userStats.newest_dream_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="info-card-creative">
                <p style={{ color: "#64748b", textAlign: "center" }}>
                  Unable to load account information. Please try refreshing the page.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="settings-section-creative">
            <h3 className="section-title-creative">Change Password</h3>
            <form onSubmit={handleChangePassword} className="settings-form-creative">
              <div className="form-group-creative">
                <label className="form-label-creative">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input-creative"
                  required
                />
              </div>

              <div className="form-group-creative">
                <label className="form-label-creative">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input-creative"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group-creative">
                <label className="form-label-creative">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input-creative"
                  required
                />
              </div>

              {error && <p className="error-text-creative">{error}</p>}
              {success && <p className="success-text-creative">{success}</p>}

              <button type="submit" className="settings-button-creative" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="settings-section-creative">
            <h3 className="section-title-creative">Data Management</h3>
            <div className="data-section-creative">
              <div className="data-card-creative">
                <h4 className="data-title-creative">📥 Export Your Dreams</h4>
                <p className="data-description-creative">
                  Download all your dreams as a JSON file. This includes all your dream entries,
                  interpretations, symbols, emotions, and image URLs.
                </p>
                <button
                  onClick={handleExportData}
                  className="settings-button-creative"
                  disabled={loading}
                >
                  {loading ? "Exporting..." : "📥 Export Dreams"}
                </button>
              </div>
            </div>
            {error && <p className="error-text-creative">{error}</p>}
            {success && <p className="success-text-creative">{success}</p>}
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="settings-section-creative">
            <h3 className="section-title-creative danger-title">⚠️ Danger Zone</h3>
            <div className="danger-section-creative">
              <div className="danger-card-creative">
                <h4 className="danger-card-title">🗑️ Delete Account</h4>
                <p className="danger-description">
                  Permanently delete your account and all associated data. This action cannot be undone.
                  All your dreams, interpretations, and images will be permanently deleted.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="danger-button-creative"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="delete-confirm-creative">
                    <p className="delete-warning">⚠️ This action is irreversible!</p>
                    <div className="form-group-creative">
                      <label className="form-label-creative">Enter your password to confirm:</label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="form-input-creative"
                        placeholder="Your password"
                      />
                    </div>
                    <div className="delete-actions-creative">
                      <button
                        onClick={handleDeleteAccount}
                        className="danger-button-creative confirm"
                        disabled={loading || !deletePassword}
                      >
                        {loading ? "Deleting..." : "Yes, Delete My Account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword("");
                          setError("");
                        }}
                        className="settings-button-creative cancel"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                    {error && <p className="error-text-creative">{error}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
