import { useState } from "react";

export default function SearchBar({ onSearch, onClear }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }

  function handleClear() {
    setQuery("");
    onClear();
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, phone, or source..."
      />
      <button type="submit" className="btn-primary">Search</button>
      {query && (
        <button type="button" className="btn-secondary" onClick={handleClear}>
          Clear
        </button>
      )}
    </form>
  );
}
