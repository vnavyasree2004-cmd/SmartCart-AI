import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Checkout({ cartItems }) {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const handlePlaceOrder = async () => {
    if (address.trim() === '') {
      alert('Please enter your delivery address.')
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first.')
      navigate('/login')
      return
    }

    setIsPlacingOrder(true)

    try {
      const orderData = {
        total_amount: totalPrice,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      const response = await fetch(
        'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)

        alert(
          errorMessage || 'Unable to place order'
        )

        return
      }

      alert('Order placed successfully!')

      navigate('/order-success', {
        state: {
          totalPrice: totalPrice,
          address: address,
          orderId: data.order.id,
        },
      })
    } catch (error) {
      console.error('Place order error:', error)
      alert('Unable to connect to server')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <section className="checkout">
      <h2>Checkout 🛒</h2>

      <h3>Order Summary</h3>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              className="checkout-item"
              key={item.id}
            >
              <p>
                {item.name} × {item.quantity}
              </p>

              <p>
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}

          <h3>Total: ₹{totalPrice}</h3>

          <h3>Delivery Address</h3>

          <input
            type="text"
            placeholder="Enter your delivery address"
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
          />

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder
              ? 'Placing Order...'
              : 'Place Order'}
          </button>
        </>
      )}
    </section>
  )
}

export default Checkout