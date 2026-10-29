import { apiFetch, responseError } from "./api";
import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import LeadsList from "./components/LeadsList";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import CreateLeadModal from "./components/CreateLeadModal";
import CreateLeadForm from "./components/CreateLeadForm";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [leads, setLeads] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState("ALL");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/v1/auth/me")
      .then(async (res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Unable to verify your session. Please sign in again.");
        return res.json();
      })
      .then((data) => { if (!cancelled) setUser(data); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setCheckingSession(false); });
    const expire = () => { setUser(null); setLeads([]); };
    window.addEventListener("blms-session-expired", expire);
    // Remove obsolete demo identity and shared caches.
    ["blms_user", "blms_leads_cache_v2", "blms_users_cache"].forEach((key) => localStorage.removeItem(key));
    return () => { cancelled = true; window.removeEventListener("blms-session-expired", expire); };
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline" | "dashboard" | "users"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoadError("");
    apiFetch("/api/v1/leads", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw await responseError(res, "Unable to load leads");
        return res.json();
      })
      .then((data) => { if (!controller.signal.aborted) setLeads(data); })
      .catch((err) => { if (!controller.signal.aborted) setLoadError(err.message); });
    return () => controller.abort();
  }, [refreshKey, user]);

  function handleLogin(userData) {
    setUser(userData);
    setPipelineStatus("ALL");
    setIsCreateModalOpen(false);
    setLeads([]);
    showToast(`Logged in as ${userData.name || "User"} (${userData.role})`);
    // Default Managers to the Dashboard view, Brokers to the Pipeline view
    if (userData.role === "MANAGER") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("pipeline");
    }
  }

  async function handleLogout() {
    try {
      const res = await apiFetch("/api/v1/auth/logout", { method: "POST" });
      if (!res.ok && res.status !== 401) throw new Error("Unable to sign out. Please try again.");
      setUser(null);
      setLeads([]);
    } catch (err) { showToast(err.message); }
  }

  function handleLeadCreated(newLead) {
    setLeads((prev) => [newLead, ...prev]);
    setRefreshKey((k) => k + 1);
    showToast(`Lead "${newLead.name}" added to pipeline!`);
  }

  function handleStatusChange(updatedLead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    setRefreshKey((k) => k + 1);
    showToast(`Status updated to ${updatedLead.status}`);
  }

  function handleLeadUpdated(updatedLead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    setRefreshKey((key) => key + 1);
    showToast(`Lead "${updatedLead.name}" details updated.`);
  }

  function handleLeadDeleted(id) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setRefreshKey((k) => k + 1);
    showToast("Lead record removed.");
  }

  function handleSearch() {
    // LeadsList searches the complete loaded dataset without replacing it.
  }

  function handleClearSearch() {
    setRefreshKey((key) => key + 1);
  }

  if (checkingSession) return <div role="status">Checking session...</div>;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const userRole = user.role || "BROKER";
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "MANAGER";
  const isBroker = userRole === "BROKER";
  const canDelete = isAdmin || isManager;

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Enterprise Navigation Bar */}
      <header className="enterprise-nav">
        <div className="nav-container">
          {/* Brand Identity */}
          <div className="nav-brand-group">
            <div className="brand-shield-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
                <path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>
              </svg>
            </div>
            <div className="brand-text-block">
              <span className="brand-main-title">BLMS</span>
              <span className="brand-secondary-title">Broker Lead Management</span>
            </div>
          </div>

          {/* Primary View Navigation */}
          <nav className="nav-links-menu">
            <button
              type="button"
              id="nav-tab-pipeline"
              className={`nav-tab-link ${activeTab === "pipeline" ? "active" : ""}`}
              onClick={() => setActiveTab("pipeline")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="6" height="14" x="3" y="5" rx="1"/><rect width="6" height="10" x="11" y="5" rx="1"/><rect width="6" height="18" x="19" y="5" rx="1"/>
              </svg>
              <span>Leads Pipeline</span>
              <span className="nav-tab-badge">{leads.length}</span>
            </button>

            {/* Analytics tab: visible to all, but emphasized for Managers */}
            <button
              type="button"
              id="nav-tab-analytics"
              className={`nav-tab-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              <span>Analytics & KPIs</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className={`nav-tab-link ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Team & Access</span>
              </button>
            )}
          </nav>

          {/* User Profile & Actions */}
          <div className="nav-profile-group">
            {/* Quick Add CTA */}
            <button
              type="button"
              className="btn-accent btn-nav-cta"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add Lead</span>
            </button>

            {/* User Pill */}
            <div className="user-profile-badge">
              <div className="user-avatar-pill">
                {getInitials(user.name || user.email)}
              </div>
              <div className="user-text-info">
                <span className="user-full-name">{user.name || user.email}</span>
                <span className={`app-role-badge role-${userRole.toLowerCase()}`}>
                  {userRole === "BROKER" ? "Broker" : userRole === "MANAGER" ? "Manager" : "Admin"}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              id="logout-btn"
              className="btn-icon-logout"
              onClick={handleLogout}
              title="Sign out of BLMS"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Application Container */}
      <main className="app-main-content">
        {/* Performance Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="tab-pane-content">
            <div className="pane-header">
              <h2>Performance & Conversion Analytics</h2>
              <p>
                {isManager
                  ? "Branch Manager Overview: Pipeline health, deal velocity, and team conversion rates"
                  : "Sales Pipeline Performance: Real-time lead volume and status breakdown"}
              </p>
            </div>
            <Dashboard
              key={refreshKey}
              onFilterStatus={(status) => { setPipelineStatus(status); setActiveTab("pipeline"); }}
            />
          </div>
        )}

        {/* Core CRM Pipeline View */}
        {activeTab === "pipeline" && (
          <div className="tab-pane-content">
            {/* Quick Lead Capture inline form */}
            {(isBroker || isAdmin) && (
              <CreateLeadForm onLeadCreated={handleLeadCreated} />
            )}

            {loadError && <div role="alert" className="auth-alert error">{loadError}</div>}
            <LeadsList
              initialStatus={pipelineStatus}
              leads={leads}
              userRole={userRole}
              canDelete={canDelete}
              onStatusChange={handleStatusChange}
              onLeadUpdated={handleLeadUpdated}
              onLeadDeleted={handleLeadDeleted}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
            />
          </div>
        )}

        {/* User Management View (Admin only) */}
        {activeTab === "users" && isAdmin && (
          <div className="tab-pane-content">
            <UserManagement />
          </div>
        )}
      </main>

      {/* Global Quick Add Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeadCreated={handleLeadCreated}
      />
    </div>
  );
}
