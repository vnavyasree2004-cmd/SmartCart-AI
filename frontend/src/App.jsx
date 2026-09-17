import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import Products from './components/Products'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import OrderConfirmation from './components/OrderConfirmation'
import ProductDetails from './components/ProductDetails'
import Login from './components/Login'
import Register from './components/register'
import OrderHistory from './components/OrderHistory'

import './App.css'

function Home({ cartItems, setCartItems }) {
  return (
    <>
      <Hero />

      <Categories />

      <Products
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </>
  )
}

function App() {
  const [cartItems, setCartItems] = React.useState([])

  return (
    <BrowserRouter>
      <div className="app">

        <Navbar />

        <main>

          <Routes>

            {/* Login */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Register */}
            <Route
              path="/register"
              element={<Register />}
            />

            {/* Home */}
            <Route
              path="/"
              element={
                <Home
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              }
            />

            {/* Cart */}
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              }
            />

            {/* Order History */}
            <Route
              path="/orders"
              element={<OrderHistory />}
            />

            {/* Checkout */}
            <Route
              path="/checkout"
              element={
                <Checkout
                  cartItems={cartItems}
                />
              }
            />

            {/* Order Success */}
            <Route
              path="/order-success"
              element={
                <OrderConfirmation />
              }
            />

            {/* Product Details */}
            <Route
              path="/product/:productName"
              element={<ProductDetails />}
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  )
}

export default App