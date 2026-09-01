import { useEffect, useState } from "react";

const STATUS_COLORS = {
  NEW: { bg: "#dbeafe", color: "#1e40af", label: "New" },
  CONTACTED: { bg: "#fef3c7", color: "#92400e", label: "Contacted" },
  QUALIFIED: { bg: "#e0e7ff", color: "#3730a3", label: "Qualified" },
  CONVERTED: { bg: "#d1fae5", color: "#065f46", label: "Converted" },
  LOST: { bg: "#fee2e2", color: "#991b1b", label: "Lost" },
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return null;

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="stat-card stat-total">
          <div className="stat-number">{summary.totalLeads}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        {Object.entries(summary.countsByStatus).map(([status, count]) => {
          const style = STATUS_COLORS[status] || {};
          return (
            <div
              key={status}
              className="stat-card"
              style={{ background: style.bg, color: style.color }}
            >
              <div className="stat-number">{count}</div>
              <div className="stat-label">{style.label || status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
