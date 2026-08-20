export default function LeadsList({ leads }) {
  if (leads.length === 0) {
    return <p>No leads yet.</p>;
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
            <td>{lead.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}