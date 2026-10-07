import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import LeadsList from "./components/LeadsList";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import CreateLeadModal from "./components/CreateLeadModal";
import CreateLeadForm from "./components/CreateLeadForm";
import SearchBar from "./components/SearchBar";

// Initial realistic Indian real-estate sample leads (used when backend is offline or fresh)
const INITIAL_DEMO_LEADS = [
  {
    id: 101,
    name: "Rahul Verma",
    contactPhone: "+91 98201 44521",
    contactEmail: "rahul.verma@gmail.com",
    source: "MagicBricks",
    notes: "Looking for 3 BHK luxury apartment in Bandra West. Budget ₹4.2 Cr. Loan pre-approved with HDFC.",
    status: "QUALIFIED",
    createdAt: "2026-10-05T10:30:00Z",
  },
  {
    id: 102,
    name: "Pooja Mehta",
    contactPhone: "+91 98334 11290",
    contactEmail: "pooja.mehta@outlook.com",
    source: "99acres",
    notes: "Interested in 2 BHK near Powai IT park. Budget ₹1.8 Cr. Wants ready-to-move property.",
    status: "CONTACTED",
    createdAt: "2026-10-06T14:15:00Z",
  },
  {
    id: 103,
    name: "Amit Shah",
    contactPhone: "+91 98199 87654",
    contactEmail: "amit.shah@corpnet.in",
    source: "Housing.com",
    notes: "Commercial office space requirement (1500 sq ft) in BKC. High priority client.",
    status: "NEW",
    createdAt: "2026-10-07T09:00:00Z",
  },
  {
    id: 104,
    name: "Sneha Kulkarni",
    contactPhone: "+91 97654 32109",
    contactEmail: "sneha.k@tcs.com",
    source: "Client Referral",
    notes: "Booked 3 BHK unit in Hiranandani Estate. Token amount ₹5 Lakhs paid. Deal finalized.",
    status: "CONVERTED",
    createdAt: "2026-09-28T11:45:00Z",
  },
  {
    id: 105,
    name: "Vikram Malhotra",
    contactPhone: "+91 98212 99001",
    contactEmail: "vikram.m@yahoo.com",
    source: "Site Visit / Walk-in",
    notes: "Looking for villa in Alibaug. Budget exceeded expectations. Client postponed purchase to next year.",
    status: "LOST",
    createdAt: "2026-09-20T16:20:00Z",
  },
];

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("blms_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [leads, setLeads] = useState(() => {
    try {
      const local = localStorage.getItem("blms_leads_cache");
      return local ? JSON.parse(local) : INITIAL_DEMO_LEADS;
    } catch {
      return INITIAL_DEMO_LEADS;
    }
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline" | "dashboard" | "users"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  function loadLeads() {
    fetch("/api/v1/leads")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLeads(data);
          localStorage.setItem("blms_leads_cache", JSON.stringify(data));
        }
      })
      .catch(() => {
        // Keeps local demo cache if backend is offline
      });
  }

  useEffect(() => {
    if (user) loadLeads();
  }, [refreshKey, user]);

  // Sync leads to local cache
  useEffect(() => {
    if (leads && leads.length > 0) {
      localStorage.setItem("blms_leads_cache", JSON.stringify(leads));
    }
  }, [leads]);

  function handleLogin(userData) {
    setUser(userData);
    showToast(`Logged in as ${userData.name || "User"} (${userData.role})`);
    // Default Managers to the Dashboard view, Brokers to the Pipeline view
    if (userData.role === "MANAGER") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("pipeline");
    }
  }

  function handleLogout() {
    fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("blms_user");
    setUser(null);
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
    showToast(`Lead "${updatedLead.name}" details updated.`);
  }

  function handleLeadDeleted(id) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setRefreshKey((k) => k + 1);
    showToast("Lead record removed.");
  }

  function handleSearch(query) {
    fetch(`/api/v1/leads/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch(() => {
        const q = query.toLowerCase();
        setLeads((prev) =>
          prev.filter(
            (l) =>
              (l.name && l.name.toLowerCase().includes(q)) ||
              (l.contactEmail && l.contactEmail.toLowerCase().includes(q)) ||
              (l.source && l.source.toLowerCase().includes(q))
          )
        );
      });
  }

  function handleClearSearch() {
    loadLeads();
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
              className={`nav-tab-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              <span>Analytics & KPIs {isManager && "★"}</span>
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
              className="btn-primary btn-nav-cta"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>+ Add Lead</span>
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
              onFilterStatus={() => setActiveTab("pipeline")}
            />
          </div>
        )}

        {/* Core CRM Pipeline View */}
        {activeTab === "pipeline" && (
          <div className="tab-pane-content">
            {/* Embedded Dashboard metrics */}
            <Dashboard
              key={refreshKey}
              onFilterStatus={() => setActiveTab("pipeline")}
            />

            {/* Quick Lead Capture inline form */}
            {(isBroker || isAdmin) && (
              <CreateLeadForm onLeadCreated={handleLeadCreated} />
            )}

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

            <LeadsList
              leads={leads}
              userRole={userRole}
              canDelete={canDelete}
              onStatusChange={handleStatusChange}
              onLeadUpdated={handleLeadUpdated}
              onLeadDeleted={handleLeadDeleted}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
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
