import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <h1 className="logo">🛒 SmartCart AI</h1>

      <nav>
        <Link to="/">Home</Link>

        <a href="#products">Products</a>

        <a href="#categories">Categories</a>

        <Link to="/cart">Cart</Link>

        <Link to="/orders">My Orders 📦</Link>
      </nav>
    </header>
  )
}

export default Navbar