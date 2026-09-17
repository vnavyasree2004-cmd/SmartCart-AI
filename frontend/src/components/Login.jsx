import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    const formData = new URLSearchParams()

    formData.append('username', email)
    formData.append('password', password)

    try {
      const response = await fetch(
         'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || 'Login failed')
        return
      }

      localStorage.setItem('token', data.access_token)

      alert('Login successful!')

      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      alert('Unable to connect to server')
    }
  }

  return (
    <section className="login">
      <h2>Login 🔐</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">
          Login
        </button>
      </form>
    </section>
  )
}

export default Login