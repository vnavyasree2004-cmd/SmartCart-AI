function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search groceries..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <button>🔍 Search</button>
    </div>
  )
}

export default SearchBar