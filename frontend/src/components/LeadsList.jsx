export default function LeadsList({ leads }) {
  return (
    <div className="card">
      <h2>Leads</h2>
      {leads.length === 0 ? (
        <p className="empty-state">No leads yet. Create one above to get started.</p>
      ) : (
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
                  <span className={`status-badge status-${lead.status}`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
