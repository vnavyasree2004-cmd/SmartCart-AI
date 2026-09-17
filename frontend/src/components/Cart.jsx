import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Cart({ cartItems, setCartItems }) {
  const navigate = useNavigate()

  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        alert('Please login first')
        navigate('/login')
        return
      }

      try {
        // Get user's cart from API Gateway
        const cartResponse = await fetch(
          'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/cart',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const cartData = await cartResponse.json()

        if (!cartResponse.ok) {
          const errorMessage =
            typeof cartData.detail === 'string'
              ? cartData.detail
              : JSON.stringify(cartData.detail)

          alert(
            errorMessage || 'Unable to load cart'
          )

          return
        }

        // Get all products
        const productsResponse = await fetch(
          'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/products'
        )

        const products = await productsResponse.json()

        if (!productsResponse.ok) {
          alert('Unable to load products')
          return
        }

        // Combine cart data with product details
        const updatedCartItems = cartData.cart
          .map((cartItem) => {
            const product = products.find(
              (item) => item.id === cartItem.product_id
            )

            if (!product) {
              return null
            }

            return {
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              image: product.image,
              quantity: cartItem.quantity,
            }
          })
          .filter(Boolean)

        setCartItems(updatedCartItems)
      } catch (error) {
        console.error('Load cart error:', error)
        alert('Unable to connect to server')
      }
    }

    loadCart()
  }, [navigate, setCartItems])

  const increaseQuantity = async (item) => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/cart/${item.id}?quantity=${item.quantity + 1}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)

        alert(
          errorMessage || 'Unable to update cart'
        )

        return
      }

      setCartItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                quantity: currentItem.quantity + 1,
              }
            : currentItem
        )
      )
    } catch (error) {
      console.error('Increase quantity error:', error)
      alert('Unable to connect to server')
    }
  }

  const decreaseQuantity = async (item) => {
    if (item.quantity <= 1) {
      return
    }

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/cart/${item.id}?quantity=${item.quantity - 1}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)

        alert(
          errorMessage || 'Unable to update cart'
        )

        return
      }

      setCartItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                quantity: currentItem.quantity - 1,
              }
            : currentItem
        )
      )
    } catch (error) {
      console.error('Decrease quantity error:', error)
      alert('Unable to connect to server')
    }
  }

  const removeItem = async (item) => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/cart',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)

        alert(
          errorMessage || 'Unable to remove item'
        )

        return
      }

      setCartItems((currentItems) =>
        currentItems.filter(
          (currentItem) => currentItem.id !== item.id
        )
      )
    } catch (error) {
      console.error('Remove item error:', error)
      alert('Unable to connect to server')
    }
  }

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  )

  return (
    <section className="cart">
      <h2>Shopping Cart 🛒</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div
                className="cart-item"
                key={item.id}
              >
                <h3>{item.name}</h3>

                <p>₹{item.price}</p>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      decreaseQuantity(item)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      increaseQuantity(item)
                    }
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      removeItem(item)
                    }
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="cart-total">
            Total: ₹{totalPrice}
          </p>

          <button
            className="checkout-button"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </section>
  )
}

export default Cart