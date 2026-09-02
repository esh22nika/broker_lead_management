import { useState, useEffect } from "react";

export default function EditLeadModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: lead.name || "",
    contactPhone: lead.contactPhone || "",
    contactEmail: lead.contactEmail || "",
    source: lead.source || "",
    notes: lead.notes || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save changes.");
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Lead"
      >
        <div className="modal-header">
          <h2>Edit Lead</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-msg">{error}</p>}
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                id="edit-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                id="edit-phone"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                id="edit-email"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="Email address"
              />
            </div>
            <div className="form-group">
              <label>Source</label>
              <input
                id="edit-source"
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="e.g. Referral, Website"
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                id="edit-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="edit-save-btn" type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
