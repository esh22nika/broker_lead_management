import { useState } from "react";
import EditLeadModal from "./EditLeadModal";

const ALL_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

const ALLOWED_STATUSES = {
  BROKER:  ["NEW", "CONTACTED", "QUALIFIED"],
  MANAGER: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"],
  ADMIN:   ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"],
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeadsList({
  leads,
  userRole,
  canDelete = true,
  onStatusChange,
  onLeadUpdated,
  onLeadDeleted,
  onOpenCreateModal,
}) {
  const [viewMode, setViewMode] = useState("table"); // "table" | "kanban"
  const [editingLead, setEditingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Filtering & Sorting
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "name"
  
  // Notes view popover
  const [viewNotesLead, setViewNotesLead] = useState(null);

  const role = userRole || "BROKER";
  const isBroker = role === "BROKER";
  const isManager = role === "MANAGER" || role === "ADMIN";
  const allowedStatuses = ALLOWED_STATUSES[role] || ALLOWED_STATUSES.BROKER;

  // Filter leads
  const filteredLeads = leads
    .filter((l) => {
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      if (sourceFilter !== "ALL" && l.source !== sourceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name?.toLowerCase().includes(q);
        const matchPhone = l.contactPhone?.toLowerCase().includes(q);
        const matchEmail = l.contactEmail?.toLowerCase().includes(q);
        const matchSource = l.source?.toLowerCase().includes(q);
        const matchNotes = l.notes?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchSource && !matchNotes) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  // Extract unique sources for filter dropdown
  const uniqueSources = Array.from(new Set(leads.map((l) => l.source).filter(Boolean)));

  function handleStatusUpdate(id, newStatus) {
    if (isBroker && (newStatus === "CONVERTED" || newStatus === "LOST")) {
      alert("Permission Denied: Only Branch Managers have the authority to mark leads as Converted (Closed Deal) or Lost.");
      return;
    }

    fetch(`/api/v1/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((updated) => onStatusChange(updated))
      .catch(() => {
        // Fallback for offline mode:
        const target = leads.find((l) => l.id === id);
        if (target) onStatusChange({ ...target, status: newStatus });
      });
  }

  function handleDelete(id, name) {
    if (!canDelete) {
      alert("Permission Denied: Brokers cannot delete lead records.");
      return;
    }
    if (!window.confirm(`Delete lead "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    fetch(`/api/v1/leads/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) onLeadDeleted(id);
        else onLeadDeleted(id); // offline fallback
      })
      .catch(() => {
        onLeadDeleted(id); // offline fallback
      })
      .finally(() => setDeletingId(null));
  }

  // Export filtered leads to CSV
  function handleExportCSV() {
    if (filteredLeads.length === 0) {
      alert("No leads available to export.");
      return;
    }
    const headers = ["ID", "Name", "Phone", "Email", "Source", "Status", "Created At", "Notes"];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.contactPhone || "").replace(/"/g, '""')}"`,
      `"${(l.contactEmail || "").replace(/"/g, '""')}"`,
      `"${(l.source || "").replace(/"/g, '""')}"`,
      l.status,
      l.createdAt || "",
      `"${(l.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `blms_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Counts by status
  const statusCounts = {
    ALL: leads.length,
    NEW: leads.filter((l) => l.status === "NEW").length,
    CONTACTED: leads.filter((l) => l.status === "CONTACTED").length,
    QUALIFIED: leads.filter((l) => l.status === "QUALIFIED").length,
    CONVERTED: leads.filter((l) => l.status === "CONVERTED").length,
    LOST: leads.filter((l) => l.status === "LOST").length,
  };

  return (
    <div className="leads-workspace">
      {/* Role Permissions Information Banner */}
      <div className={`role-permission-banner ${isBroker ? "broker-mode" : "manager-mode"}`}>
        <div className="banner-text-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {isBroker ? (
            <span>
              <strong>Broker Permissions:</strong> You can add prospects and advance them through <strong>New</strong>, <strong>Contacted</strong>, and <strong>Qualified</strong>. Marking deals <strong>Converted</strong> (Closed) or <strong>Lost</strong> requires Manager approval. Lead deletion is disabled.
            </span>
          ) : (
            <span>
              <strong>Manager Permissions:</strong> Full supervisory oversight. You have full authority to mark deals <strong>Converted (Won)</strong> or <strong>Lost</strong>, delete invalid records, and view company-wide pipeline metrics.
            </span>
          )}
        </div>
      </div>

      {/* Workspace Controls Header */}
      <div className="workspace-header">
        <div className="workspace-header-left">
          <h3 className="workspace-title">Broker Lead Records</h3>
          <span className="workspace-counter">
            Showing {filteredLeads.length} of {leads.length} records
          </span>
        </div>

        <div className="workspace-header-actions">
          {/* View Mode Toggle */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span>Table</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
              onClick={() => setViewMode("kanban")}
              title="Pipeline Board View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="6" height="14" x="3" y="5" rx="1"/><rect width="6" height="10" x="11" y="5" rx="1"/><rect width="6" height="18" x="19" y="5" rx="1"/>
              </svg>
              <span>Pipeline</span>
            </button>
          </div>

          {/* Export to CSV */}
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={handleExportCSV}
            title="Download CSV report of current leads"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export CSV</span>
          </button>

          {/* Add Lead CTA */}
          {onOpenCreateModal && (
            <button
              type="button"
              className="btn-accent btn-sm"
              onClick={onOpenCreateModal}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>+ Capture Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        {/* Search Input */}
        <div className="filter-search-wrap">
          <svg className="filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="filter-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by client name, email, phone, or requirements..."
          />
          {searchQuery && (
            <button type="button" className="filter-clear-btn" onClick={() => setSearchQuery("")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Source Filter */}
        <div className="filter-select-wrap">
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="ALL">All Sources</option>
            {uniqueSources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="filter-select-wrap">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="name">Sort: Client Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="status-chips-bar">
        {["ALL", "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((st) => (
          <button
            key={st}
            type="button"
            className={`status-chip-btn ${st.toLowerCase()} ${statusFilter === st ? "active" : ""}`}
            onClick={() => setStatusFilter(st)}
          >
            <span className="chip-label">{st === "ALL" ? "All Leads" : st}</span>
            <span className="chip-count">{statusCounts[st] || 0}</span>
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredLeads.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <h4>No matching leads found</h4>
          <p>
            {leads.length === 0
              ? "You haven't captured any leads yet. Start by adding your first client inquiry."
              : "Try adjusting your search query or status filter to see other records."}
          </p>
          {onOpenCreateModal && (
            <button type="button" className="btn-accent" onClick={onOpenCreateModal}>
              + Capture First Lead
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="table-responsive-container">
          <table className="leads-data-table">
            <thead>
              <tr>
                <th>Lead / Client</th>
                <th>Contact Details</th>
                <th>Source</th>
                <th>Requirements / Budget</th>
                <th>Created</th>
                <th>Pipeline Stage</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="lead-row">
                  {/* Lead Name + Avatar */}
                  <td>
                    <div className="lead-avatar-cell">
                      <div className="lead-avatar">
                        {getInitials(lead.name)}
                      </div>
                      <div className="lead-name-info">
                        <span className="lead-name-primary">{lead.name}</span>
                        <span className="lead-id-sub">Ref #{lead.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info with tel/mailto */}
                  <td>
                    <div className="lead-contact-cell">
                      {lead.contactPhone ? (
                        <a href={`tel:${lead.contactPhone}`} className="contact-link phone">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          <span>{lead.contactPhone}</span>
                        </a>
                      ) : (
                        <span className="text-muted">No phone</span>
                      )}
                      {lead.contactEmail && (
                        <a href={`mailto:${lead.contactEmail}`} className="contact-link email">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                          <span>{lead.contactEmail}</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td>
                    <span className="source-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      {lead.source || "Direct Inquiry"}
                    </span>
                  </td>

                  {/* Notes snippet */}
                  <td>
                    <div
                      className="notes-preview-cell"
                      onClick={() => lead.notes && setViewNotesLead(lead)}
                      title={lead.notes ? "Click to view full notes" : "No notes"}
                    >
                      <span>{lead.notes ? (lead.notes.length > 40 ? lead.notes.slice(0, 40) + "…" : lead.notes) : "—"}</span>
                      {lead.notes && lead.notes.length > 40 && (
                        <span className="notes-more-pill">view</span>
                      )}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td>
                    <span className="date-cell">{formatDate(lead.createdAt)}</span>
                  </td>

                  {/* Role-guarded Status Dropdown */}
                  <td>
                    <select
                      className={`status-select status-select-pill status-${lead.status}`}
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                    >
                      {/* Operational stages available to everyone */}
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="QUALIFIED">QUALIFIED</option>

                      {/* Closing stages: Enabled for Manager, disabled with hint for Broker */}
                      {isManager ? (
                        <>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="LOST">LOST</option>
                        </>
                      ) : (
                        <>
                          <option value="CONVERTED" disabled>CONVERTED (Manager Only)</option>
                          <option value="LOST" disabled>LOST (Manager Only)</option>
                        </>
                      )}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="actions-col">
                    <div className="table-action-btns">
                      <button
                        type="button"
                        className="action-icon-btn edit"
                        title="Edit lead details"
                        onClick={() => setEditingLead(lead)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          title="Delete lead record (Manager/Admin Only)"
                          disabled={deletingId === lead.id}
                          onClick={() => handleDelete(lead.id, lead.name)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="kanban-pipeline-board">
          {ALL_STATUSES.map((statusCol) => {
            const colLeads = filteredLeads.filter((l) => l.status === statusCol);
            const isRestrictedForBroker = isBroker && (statusCol === "CONVERTED" || statusCol === "LOST");

            return (
              <div key={statusCol} className={`kanban-column col-${statusCol.toLowerCase()} ${isRestrictedForBroker ? "col-restricted" : ""}`}>
                <div className="kanban-column-header">
                  <div className="kanban-col-title-wrap">
                    <span className={`kanban-col-indicator dot-${statusCol.toLowerCase()}`} />
                    <span className="kanban-col-title">{statusCol}</span>
                  </div>
                  <span className="kanban-col-badge">{colLeads.length}</span>
                </div>

                {isRestrictedForBroker && (
                  <div className="kanban-role-notice">
                    Manager Authority Required
                  </div>
                )}

                <div className="kanban-cards-stack">
                  {colLeads.length === 0 ? (
                    <div className="kanban-empty-col">No leads in this stage</div>
                  ) : (
                    colLeads.map((lead) => (
                      <div key={lead.id} className="kanban-lead-card">
                        <div className="kanban-card-top">
                          <span className="kanban-lead-name">{lead.name}</span>
                          <span className="kanban-source-badge">{lead.source || "Direct"}</span>
                        </div>

                        {lead.notes && (
                          <p className="kanban-card-notes">{lead.notes}</p>
                        )}

                        <div className="kanban-card-contact">
                          {lead.contactPhone && (
                            <span className="kanban-contact-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              {lead.contactPhone}
                            </span>
                          )}
                          {lead.contactEmail && (
                            <span className="kanban-contact-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                              </svg>
                              {lead.contactEmail}
                            </span>
                          )}
                        </div>

                        <div className="kanban-card-footer">
                          <span className="kanban-date">{formatDate(lead.createdAt)}</span>
                          <div className="kanban-card-actions">
                            <button
                              type="button"
                              className="kanban-action-btn"
                              title="Edit lead"
                              onClick={() => setEditingLead(lead)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>

                            <select
                              className="kanban-stage-selector"
                              value={lead.status}
                              onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="QUALIFIED">QUALIFIED</option>
                              {isManager ? (
                                <>
                                  <option value="CONVERTED">CONVERTED</option>
                                  <option value="LOST">LOST</option>
                                </>
                              ) : (
                                <>
                                  <option value="CONVERTED" disabled>CONVERTED (Mgr)</option>
                                  <option value="LOST" disabled>LOST (Mgr)</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSaved={(updated) => {
            onLeadUpdated(updated);
            setEditingLead(null);
          }}
        />
      )}

      {/* Quick Notes Dialog */}
      {viewNotesLead && (
        <div className="modal-backdrop" onClick={() => setViewNotesLead(null)}>
          <div className="modal-card small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <h3 className="modal-title">{viewNotesLead.name} — Requirements</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setViewNotesLead(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body-pad">
              <p className="full-notes-text">{viewNotesLead.notes}</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setViewNotesLead(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
