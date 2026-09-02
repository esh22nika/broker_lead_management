import { useState } from "react";
import EditLeadModal from "./EditLeadModal";

// Role-based allowed status transitions
const ALLOWED_STATUSES = {
  BROKER:  ["NEW", "CONTACTED", "QUALIFIED"],
  MANAGER: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"],
  ADMIN:   ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"],
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function LeadsList({ leads, userRole, onStatusChange, onLeadUpdated, onLeadDeleted }) {
  const [editingLead, setEditingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const role = userRole || "BROKER";
  const allowedStatuses = ALLOWED_STATUSES[role] || ALLOWED_STATUSES.BROKER;

  function handleStatusChange(id, newStatus) {
    fetch(`/api/v1/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((updated) => onStatusChange(updated))
      .catch(() => {});
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    setDeletingId(id);
    fetch(`/api/v1/leads/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) onLeadDeleted(id);
      })
      .catch(() => {})
      .finally(() => setDeletingId(null));
  }

  return (
    <>
      <div className="card">
        <h2>Leads</h2>
        {leads.length === 0 ? (
          <p className="empty-state">No leads yet. Create one above to get started.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Notes</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.contactPhone || "—"}</td>
                    <td>{lead.contactEmail || "—"}</td>
                    <td>{lead.source || "—"}</td>
                    <td className="notes-cell" title={lead.notes}>
                      {lead.notes ? (lead.notes.length > 40 ? lead.notes.slice(0, 40) + "…" : lead.notes) : "—"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(lead.createdAt)}</td>
                    <td>
                      <select
                        className={`status-select status-${lead.status}`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      >
                        {allowedStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        {/* Always show current status even if role can't set it */}
                        {!allowedStatuses.includes(lead.status) && (
                          <option value={lead.status} disabled>{lead.status}</option>
                        )}
                      </select>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          id={`edit-lead-${lead.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Edit lead"
                          onClick={() => setEditingLead(lead)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          id={`delete-lead-${lead.id}`}
                          className="btn-icon btn-icon-delete"
                          title="Delete lead"
                          disabled={deletingId === lead.id}
                          onClick={() => handleDelete(lead.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </>
  );
}
