function CategoryCard({ emoji, name }) {
  return (
    <div className="category-card">
      <div className="category-emoji">{emoji}</div>
      <h3>{name}</h3>
    </div>
  )
}

export default CategoryCard