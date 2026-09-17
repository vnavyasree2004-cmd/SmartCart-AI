import { useNavigate } from 'react-router-dom'

function ProductCard({
  id,
  image,
  name,
  price,
  category,
  setCartItems,
}) {
  const navigate = useNavigate()

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first')
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: id,
            quantity: 1,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)

        alert(
          errorMessage || 'Unable to add product to cart'
        )

        return
      }

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.name === name
        )

        if (existingItem) {
          return currentItems.map((item) =>
            item.name === name
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          )
        }

        return [
          ...currentItems,
          {
            id,
            image,
            name,
            price,
            category,
            quantity: 1,
          },
        ]
      })

      alert('Product added to cart successfully!')
    } catch (error) {
      console.error('Add to cart error:', error)

      alert('Unable to connect to server')
    }
  }

  return (
    <div className="product-card">

      <div className="product-image">
        <img
          src={image}
          alt={name}
        />
      </div>

      <div className="product-info">

        <p className="product-category">
          {category}
        </p>

        <h3
          onClick={() =>
            navigate(`/product/${name}`, {
              state: {
                image,
                name,
                price,
                category,
              },
            })
          }
        >
          {name}
        </h3>

        <p className="product-price">
          ₹{price}
        </p>

        <button onClick={handleAddToCart}>
          Add to Cart
        </button>

      </div>

    </div>
  )
}

export default ProductCard