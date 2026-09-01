const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export default function LeadsList({ leads, onStatusChange }) {
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

  return (
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.contactPhone}</td>
                  <td>{lead.contactEmail}</td>
                  <td>{lead.source}</td>
                  <td>
                    <select
                      className={`status-select status-${lead.status}`}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
