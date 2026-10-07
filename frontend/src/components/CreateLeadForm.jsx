import { useState } from "react";

const LEAD_SOURCES = ["Website", "Referral", "Zillow / Portal", "Walk-in", "Direct Call", "Open House", "Social Media"];

export default function CreateLeadForm({ onLeadCreated }) {
  const [form, setForm] = useState({
    name: "",
    contactPhone: "",
    contactEmail: "",
    source: "Website",
    notes: "",
  });
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create lead");
      }

      const created = await res.json();
      setForm({ name: "", contactPhone: "", contactEmail: "", source: "Website", notes: "" });
      setIsExpanded(false);
      onLeadCreated(created);
    } catch (err) {
      setError(err.message || "Could not create lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-title-wrap">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          <div>
            <h3>Quick Lead Capture</h3>
            <p>Direct entry for incoming prospect inquiries</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse Form" : "+ Expand Form"}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="form-content-pad">
          {error && <div className="auth-alert error">{error}</div>}
          <div className="form-grid-3col">
            <div className="form-field">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Doe" required />
            </div>
            <div className="form-field">
              <label>Phone Number</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="form-field">
              <label>Email Address</label>
              <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="john@example.com" />
            </div>
          </div>
          <div className="form-grid-2col" style={{ marginTop: "1rem" }}>
            <div className="form-field">
              <label>Lead Source</label>
              <select name="source" value={form.source} onChange={handleChange}>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Initial Notes & Requirements</label>
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Budget, target neighborhood, timeframe..." />
            </div>
          </div>
          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Prospect"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
