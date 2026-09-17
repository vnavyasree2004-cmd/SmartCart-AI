import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OrderHistory() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        alert('Please login first')
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/orders',
          {
            method: 'GET',
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
            errorMessage || 'Unable to load orders'
          )

          return
        }

        setOrders(data.orders)
      } catch (error) {
        console.error('Load orders error:', error)
        alert('Unable to connect to server')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [navigate])

  if (loading) {
    return (
      <section className="order-history">
        <h2>My Orders 📦</h2>
        <p>Loading orders...</p>
      </section>
    )
  }

  return (
    <section className="order-history">
      <h2>My Orders 📦</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              className="order-card"
              key={order.id}
            >
              <h3>Order #{order.id}</h3>

              <p>
                <strong>Total:</strong> ₹
                {order.total_amount}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {order.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default OrderHistory