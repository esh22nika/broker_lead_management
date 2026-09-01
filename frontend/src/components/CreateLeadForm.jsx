import { useState } from "react";

export default function CreateLeadForm({ onLeadCreated }) {
  const [form, setForm] = useState({
    name: "",
    contactPhone: "",
    contactEmail: "",
    source: "",
    notes: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    const res = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError("Could not create lead");
      return;
    }

    const created = await res.json();
    setForm({ name: "", contactPhone: "", contactEmail: "", source: "", notes: "" });
    onLeadCreated(created);
  }

  return (
    <div className="card">
      <h2>Add a Lead</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="Email address" />
          </div>
          <div className="form-group">
            <label>Source</label>
            <input name="source" value={form.source} onChange={handleChange} placeholder="e.g. Referral, Website" />
          </div>
          <div className="form-group full-width">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." />
          </div>
        </div>
        <button type="submit" className="btn-primary">Create Lead</button>
      </form>
    </div>
  );
}
