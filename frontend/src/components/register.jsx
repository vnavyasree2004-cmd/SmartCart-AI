import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(
        'https://tpbvuem898.execute-api.ap-south-1.amazonaws.com/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || 'Registration failed')
        return
      }

      alert('Registration successful!')

      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      alert('Unable to connect to server')
    }
  }

  return (
    <section className="register">
      <h2>Create Account 📝</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">
          Register
        </button>
      </form>
    </section>
  )
}

export default Register