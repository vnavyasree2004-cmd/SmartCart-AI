import { useLocation, useNavigate } from 'react-router-dom'

function OrderConfirmation() {
  const navigate = useNavigate()
  const location = useLocation()

  const totalPrice = location.state?.totalPrice ?? 0
  const orderId = location.state?.orderId ?? 'N/A'

  return (
    <section className="order-confirmation">
      <div className="success-icon">✓</div>

      <h2>Order Placed Successfully! 🎉</h2>

      <p>Thank you for shopping with SmartCart AI.</p>

      <div className="order-details">
        <p>
          <strong>Order ID:</strong> {orderId}
        </p>

        <p>
          <strong>Total Amount:</strong> ₹{totalPrice}
        </p>

        <p>
          <strong>Status:</strong> Order Confirmed
        </p>
      </div>

      <button onClick={() => navigate('/')}>
        Continue Shopping 🛍️
      </button>
    </section>
  )
}

export default OrderConfirmation