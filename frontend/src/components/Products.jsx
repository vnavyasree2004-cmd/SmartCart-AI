import React from 'react'
import ProductCard from './ProductCard'
import SearchBar from './SearchBar'

function Products({ cartItems, setCartItems }) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [products, setProducts] = React.useState([])

  React.useEffect(() => {
    fetch('https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error))
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className="products" id="products">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <h2>Popular Products</h2>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
            category={product.category}
            setCartItems={setCartItems}
          />
        ))}
      </div>
    </section>
  )
}

export default Products