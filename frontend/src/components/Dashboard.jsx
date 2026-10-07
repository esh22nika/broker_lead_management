import { useEffect, useState } from "react";

export default function Dashboard({ onFilterStatus }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="section-card">
        <div className="loading-placeholder">Loading performance analytics...</div>
      </div>
    );
  }

  const counts = summary?.countsByStatus || {
    NEW: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    CONVERTED: 0,
    LOST: 0,
  };
  const total = summary?.totalLeads || 0;
  const conversionRate = total > 0 ? Math.round(((counts.CONVERTED || 0) / total) * 100) : 0;
  const activePipeline = (counts.NEW || 0) + (counts.CONTACTED || 0) + (counts.QUALIFIED || 0);

  return (
    <div className="dashboard-wrapper">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Leads */}
        <div className="kpi-card" onClick={() => onFilterStatus && onFilterStatus("ALL")}>
          <div className="kpi-card-top">
            <span className="kpi-label">Total Prospects</span>
            <div className="kpi-icon-wrap total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="kpi-number">{total}</div>
          <div className="kpi-footer">
            <span className="kpi-trend neutral">All active & closed records</span>
          </div>
        </div>

        {/* New Leads */}
        <div className="kpi-card" onClick={() => onFilterStatus && onFilterStatus("NEW")}>
          <div className="kpi-card-top">
            <span className="kpi-label">New Inquiries</span>
            <div className="kpi-icon-wrap new">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>
          <div className="kpi-number">{counts.NEW || 0}</div>
          <div className="kpi-footer">
            <span className="kpi-trend highlight">Action required</span>
          </div>
        </div>

        {/* Contacted */}
        <div className="kpi-card" onClick={() => onFilterStatus && onFilterStatus("CONTACTED")}>
          <div className="kpi-card-top">
            <span className="kpi-label">In Discussion</span>
            <div className="kpi-icon-wrap contacted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          </div>
          <div className="kpi-number">{counts.CONTACTED || 0}</div>
          <div className="kpi-footer">
            <span className="kpi-trend">Initial contact made</span>
          </div>
        </div>

        {/* Qualified */}
        <div className="kpi-card" onClick={() => onFilterStatus && onFilterStatus("QUALIFIED")}>
          <div className="kpi-card-top">
            <span className="kpi-label">Qualified Buyers</span>
            <div className="kpi-icon-wrap qualified">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <div className="kpi-number">{counts.QUALIFIED || 0}</div>
          <div className="kpi-footer">
            <span className="kpi-trend">Pre-approved / High intent</span>
          </div>
        </div>

        {/* Converted */}
        <div className="kpi-card" onClick={() => onFilterStatus && onFilterStatus("CONVERTED")}>
          <div className="kpi-card-top">
            <span className="kpi-label">Deals Closed</span>
            <div className="kpi-icon-wrap converted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="kpi-number">{counts.CONVERTED || 0}</div>
          <div className="kpi-footer">
            <span className="kpi-trend positive">{conversionRate}% win rate</span>
          </div>
        </div>
      </div>

      {/* Pipeline Velocity Health Bar */}
      <div className="pipeline-health-card">
        <div className="pipeline-health-header">
          <div>
            <h4>Pipeline Stage Breakdown</h4>
            <p className="subtitle">Real-time distribution of active broker opportunities</p>
          </div>
          <div className="pipeline-summary-tag">
            <span>{activePipeline} Active Deals in Pipeline</span>
          </div>
        </div>

        <div className="pipeline-progress-bar">
          <div
            className="bar-segment new"
            style={{ width: `${total ? ((counts.NEW || 0) / total) * 100 : 0}%` }}
            title={`New: ${counts.NEW || 0}`}
          />
          <div
            className="bar-segment contacted"
            style={{ width: `${total ? ((counts.CONTACTED || 0) / total) * 100 : 0}%` }}
            title={`Contacted: ${counts.CONTACTED || 0}`}
          />
          <div
            className="bar-segment qualified"
            style={{ width: `${total ? ((counts.QUALIFIED || 0) / total) * 100 : 0}%` }}
            title={`Qualified: ${counts.QUALIFIED || 0}`}
          />
          <div
            className="bar-segment converted"
            style={{ width: `${total ? ((counts.CONVERTED || 0) / total) * 100 : 0}%` }}
            title={`Converted: ${counts.CONVERTED || 0}`}
          />
          <div
            className="bar-segment lost"
            style={{ width: `${total ? ((counts.LOST || 0) / total) * 100 : 0}%` }}
            title={`Lost: ${counts.LOST || 0}`}
          />
        </div>

        <div className="pipeline-legend">
          <div className="legend-item"><span className="dot new" />New ({counts.NEW || 0})</div>
          <div className="legend-item"><span className="dot contacted" />Contacted ({counts.CONTACTED || 0})</div>
          <div className="legend-item"><span className="dot qualified" />Qualified ({counts.QUALIFIED || 0})</div>
          <div className="legend-item"><span className="dot converted" />Converted ({counts.CONVERTED || 0})</div>
          <div className="legend-item"><span className="dot lost" />Lost ({counts.LOST || 0})</div>
        </div>
      </div>
    </div>
  );
}
