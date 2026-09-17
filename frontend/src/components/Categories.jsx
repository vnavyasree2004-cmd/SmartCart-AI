import CategoryCard from './CategoryCard'

function Categories() {
  const categories = [
    { emoji: '🍎', name: 'Fruits & Vegetables' },
    { emoji: '🥛', name: 'Dairy & Eggs' },
    { emoji: '🍞', name: 'Bakery' },
    { emoji: '🍿', name: 'Snacks' },
    { emoji: '🥤', name: 'Beverages' },
    { emoji: '🧹', name: 'Household' },
  ]

  return (
    <section className="categories">
      <section className="categories" id="categories"></section>
      <h2>Shop by Category</h2>

      <div className="category-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            emoji={category.emoji}
            name={category.name}
          />
        ))}
      </div>
    </section>
  )
}

export default Categories