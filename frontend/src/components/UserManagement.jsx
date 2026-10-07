import { useEffect, useState } from "react";

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BROKER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  function loadUsers() {
    fetch("/api/v1/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create user account.");
      }
      setForm({ name: "", email: "", password: "", role: "BROKER" });
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user) {
    await fetch(`/api/v1/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    loadUsers();
  }

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-title-wrap">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <h3>Brokerage Team & Access Control</h3>
            <p>Manage broker and manager accounts, credentials, and roles</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={() => { setError(""); setShowModal(true); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>+ Add Member</span>
        </button>
      </div>

      <div style={{ padding: "0 1.5rem 1rem" }}>
        <div className="filter-search-wrap" style={{ maxWidth: "320px", marginBottom: "1rem" }}>
          <svg className="filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="filter-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
          />
        </div>

        <div className="table-responsive-container">
          <table className="leads-data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th className="actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="lead-row">
                  <td>
                    <div className="lead-avatar-cell">
                      <div className="lead-avatar user-av">
                        {getInitials(u.name)}
                      </div>
                      <span className="lead-name-primary">{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${u.email}`} className="contact-link email">
                      <span>{u.email}</span>
                    </a>
                  </td>
                  <td>
                    <span className={`app-role-badge role-${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-pill ${u.active ? "active" : "inactive"}`}>
                      <span className={`status-dot ${u.active ? "green" : "gray"}`} />
                      {u.active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="actions-col">
                    <button
                      type="button"
                      className={`btn-table-action ${u.active ? "deactivate" : "activate"}`}
                      onClick={() => toggleActive(u)}
                    >
                      {u.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </div>
                <div>
                  <h3 className="modal-title">Add Team Member</h3>
                  <p className="modal-subtitle">Provision account credentials and access permissions</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              {error && <div className="auth-alert error">{error}</div>}
              <div className="form-grid-2col">
                <div className="form-field full-col">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. David Ross"
                    required
                  />
                </div>
                <div className="form-field full-col">
                  <label>Work Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="david@brokerage.com"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Initial Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Assigned Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="BROKER">Broker</option>
                    <option value="MANAGER">Sales Manager</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
