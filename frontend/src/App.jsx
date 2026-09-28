import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import CreateLeadForm from "./components/CreateLeadForm";
import LeadsList from "./components/LeadsList";
import SearchBar from "./components/SearchBar";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("blms_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [leads, setLeads] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  function loadLeads() {
    fetch("/api/v1/leads")
      .then((res) => res.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }

  useEffect(() => {
    if (user) loadLeads();
  }, [refreshKey, user]);

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("blms_user");
    setUser(null);
    setLeads([]);
  }

  function handleLeadCreated(newLead) {
    setLeads((prev) => [newLead, ...prev]);
    setRefreshKey((k) => k + 1);
  }

  function handleSearch(query) {
    fetch(`/api/v1/leads/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }

  function handleClearSearch() {
    loadLeads();
  }

  function handleStatusChange(updatedLead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    setRefreshKey((k) => k + 1);
  }

  function handleLeadUpdated(updatedLead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
  }

  function handleLeadDeleted(id) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setRefreshKey((k) => k + 1);
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const userRole = user.role || "BROKER";
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "MANAGER";
  const isBroker = userRole === "BROKER";
  const canDelete = isAdmin || isManager;

  return (
    <div className="app">
      <div className="app-header">
        <h1>Broker Lead Management System</h1>
        <div className="app-header-right">
          <span className={`app-role-badge role-${userRole.toLowerCase()}`}>
            {userRole}
          </span>
          <span className="app-user-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
            {user.name || user.email}
          </span>
          <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard: visible to Manager and Admin */}
      {(isManager || isAdmin) && <Dashboard key={refreshKey} />}

      {/* Create Lead: visible to Broker and Admin */}
      {(isBroker || isAdmin) && <CreateLeadForm onLeadCreated={handleLeadCreated} />}

      {/* User Management: Admin only */}
      {isAdmin && <UserManagement />}

      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
      <LeadsList
        leads={leads}
        userRole={userRole}
        canDelete={canDelete}
        onStatusChange={handleStatusChange}
        onLeadUpdated={handleLeadUpdated}
        onLeadDeleted={handleLeadDeleted}
      />
    </div>
  );
}
