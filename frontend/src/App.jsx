import { useEffect, useState } from "react";
import CreateLeadForm from "./components/CreateLeadForm";
import LeadsList from "./components/LeadsList";
import SearchBar from "./components/SearchBar";
import Dashboard from "./components/Dashboard";

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

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>BLMS - Lead Tracker</h1>
      <Dashboard key={refreshKey} />
      <CreateLeadForm onLeadCreated={handleLeadCreated} />
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
      <LeadsList leads={leads} onStatusChange={handleStatusChange} />
    </div>
  );
}
