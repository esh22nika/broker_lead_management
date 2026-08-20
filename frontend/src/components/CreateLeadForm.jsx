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
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <h2>Add a lead</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <label>Phone</label>
        <input name="contactPhone" value={form.contactPhone} onChange={handleChange} />
      </div>
      <div>
        <label>Email</label>
        <input name="contactEmail" value={form.contactEmail} onChange={handleChange} />
      </div>
      <div>
        <label>Source</label>
        <input name="source" value={form.source} onChange={handleChange} />
      </div>
      <div>
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} />
      </div>
      <button type="submit">Create lead</button>
    </form>
  );
}