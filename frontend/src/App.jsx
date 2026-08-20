import { useEffect, useState } from "react";
import CreateLeadForm from "./components/CreateLeadForm";
import LeadsList from "./components/LeadsList";

export default function App() {
  const [leads, setLeads] = useState([]);

  function loadLeads() {
    fetch("/api/v1/leads")
      .then((res) => res.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }

  useEffect(() => {
    loadLeads();
  }, []);

  function handleLeadCreated(newLead) {
    setLeads((prev) => [newLead, ...prev]);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Broker Lead Management System</h1>
      <CreateLeadForm onLeadCreated={handleLeadCreated} />
      <h2>Leads</h2>
      <LeadsList leads={leads} />
    </div>
  );
}