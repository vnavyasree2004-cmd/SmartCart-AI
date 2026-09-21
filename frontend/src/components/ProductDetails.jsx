import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function ProductDetails() {
  const location = useLocation()
  const navigate = useNavigate()

  const product = location.state

  const [recommendations, setRecommendations] = React.useState([])
  const [loadingRecommendations, setLoadingRecommendations] =
    React.useState(false)

  // Deep Learning Image Recognition
  const [selectedImage, setSelectedImage] = React.useState(null)
  const [recognitionResult, setRecognitionResult] =
    React.useState(null)
  const [recognizing, setRecognizing] = React.useState(false)

  React.useEffect(() => {
    if (!product?.name) {
      return
    }

    setLoadingRecommendations(true)

    fetch(
      `http://3.108.58.55:8000/recommendations/${encodeURIComponent(
        product.name
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        setRecommendations(data.recommendations || [])
      })
      .catch((error) => {
        console.error(
          'Error fetching recommendations:',
          error
        )
      })
      .finally(() => {
        setLoadingRecommendations(false)
      })
  }, [product?.name])

  // Deep Learning Image Recognition API
  const handleImageRecognition = async () => {
    if (!selectedImage) {
      return
    }

    setRecognizing(true)
    setRecognitionResult(null)

    const formData = new FormData()
    formData.append('file', selectedImage)

    try {
      const response = await fetch(
        'http://3.108.58.55:8000/recognize-image',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Image recognition failed'
        )
      }

      setRecognitionResult(data)
    } catch (error) {
      console.error(
        'Error recognizing image:',
        error
      )

      setRecognitionResult({
        success: false,
        error: error.message,
      })
    } finally {
      setRecognizing(false)
    }
  }

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

      {/* Deep Learning Image Recognition */}
      <div className="image-recognition">
        <h2>AI Product Image Recognition 🤖📷</h2>

        <p>
          Upload a grocery product image and SmartCart AI
          will identify the product and category.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            setSelectedImage(event.target.files[0])
            setRecognitionResult(null)
          }}
        />

        {selectedImage && (
          <p>
            Selected Image: {selectedImage.name}
          </p>
        )}

        <button
          onClick={handleImageRecognition}
          disabled={!selectedImage || recognizing}
        >
          {recognizing
            ? 'Recognizing... 🔄'
            : 'Recognize Product 🔍'}
        </button>

        {recognitionResult?.success && (
          <div className="recognition-result">
            <h3>Recognition Result</h3>

            <p>
              <strong>Product:</strong>{' '}
              {recognitionResult.product}
            </p>

            <p>
              <strong>Category:</strong>{' '}
              {recognitionResult.category}
            </p>

            <p>
              <strong>Confidence:</strong>{' '}
              {recognitionResult.confidence}%
            </p>
          </div>
        )}

        {recognitionResult?.success === false && (
          <p>
            ❌ {recognitionResult.error}
          </p>
        )}
      </div>

      {/* Existing ML Recommendations */}
      <div className="recommendations">
        <h2>Recommended for You 🤖</h2>

        {loadingRecommendations && (
          <p>Loading recommendations...</p>
        )}

        {!loadingRecommendations &&
          recommendations.length === 0 && (
            <p>No recommendations available.</p>
          )}

        <div className="recommendation-list">
          {recommendations.map((item) => (
            <div
              className="recommendation-card"
              key={item.product}
            >
              <h3>{item.product}</h3>

              <p>{item.category}</p>

              <p>₹{item.price}</p>

              <p>⭐ {item.rating}</p>

              <small>
                Similarity: {item.similarity_score}
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductDetails
