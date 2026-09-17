import { useLocation, useNavigate } from 'react-router-dom'

function ProductDetails() {
  const location = useLocation()
  const navigate = useNavigate()

  const product = location.state

  if (!product) {
    return (
      <section className="product-details">
        <h2>Product not found</h2>

        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      </section>
    )
  }

  return (
    <section className="product-details">
      <img src={product.image} alt={product.name} />

      <div className="product-details-info">
        <p>{product.category}</p>

        <h2>{product.name}</h2>

        <h3>₹{product.price}</h3>

        <p>
          Fresh and high-quality grocery product available
          at SmartCart AI.
        </p>

        <button onClick={() => navigate('/')}>
          Continue Shopping 🛍️
        </button>
      </div>
    </section>
  )
}

export default ProductDetails