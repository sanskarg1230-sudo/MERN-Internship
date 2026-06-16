function SearchFilter({
  search,
  setSearch,
  category,
  setCategory,
  categories,
}) {
  return (
    <div className="search-filter">
      <input
        type="text"
        placeholder="Search Product..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <select
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      >
        <option value="All">
          All Categories
        </option>

        {categories.map((cat) => (
          <option
            key={cat._id}
            value={cat._id}
          >
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchFilter;