import { useEffect, useState } from "react";
import CreateLeadForm from "./components/CreateLeadForm";
import LeadsList from "./components/LeadsList";
import SearchBar from "./components/SearchBar";
import Dashboard from "./components/Dashboard";

// This branch (feature/lead-detail-edit) does NOT have the login page yet.
// It adds delete/edit handlers and role prop. The login page is on
// feature/login-page — these two branches deliberately diverge on App.jsx
// to demonstrate a merge conflict.

export default function App() {
  const [leads, setLeads] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  function loadLeads() {
    fetch("/api/v1/leads")
      .then((res) => res.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }

  useEffect(() => {
    loadLeads();
  }, [refreshKey]);

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

  return (
    <div className="app">
      {/* NOTE: This h1 intentionally conflicts with the app-header div
          introduced in feature/login-page — demonstrates merge conflict */}
      <h1>BLMS — Broker Lead Management</h1>
      <Dashboard key={refreshKey} />
      <CreateLeadForm onLeadCreated={handleLeadCreated} />
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
      <LeadsList
        leads={leads}
        userRole="MANAGER"
        onStatusChange={handleStatusChange}
        onLeadUpdated={handleLeadUpdated}
        onLeadDeleted={handleLeadDeleted}
      />
    </div>
  );
}
