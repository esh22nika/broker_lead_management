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

  if (leads.length === 0) {
    return <p>No leads found.</p>;
  }

  return (
    <table border="1" cellPadding="6">
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
  );
}
