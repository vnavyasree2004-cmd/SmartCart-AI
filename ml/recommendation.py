import os
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

# Load grocery product dataset

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data = pd.read_csv(os.path.join(BASE_DIR, "products.csv"))

# Features used for recommendation
features = ["price", "popularity", "rating"]

# Convert features into the same scale
scaler = StandardScaler()
feature_matrix = scaler.fit_transform(data[features])

# Calculate similarity between products
similarity_matrix = cosine_similarity(feature_matrix)


def recommend_products(product_name, number_of_recommendations=3):
    """Recommend products similar to the selected product."""

    if product_name not in data["product"].values:
        return []

    product_index = data.index[
        data["product"] == product_name
    ][0]

    similarity_scores = list(
        enumerate(similarity_matrix[product_index])
    )

    # Sort products by similarity
    similarity_scores = sorted(
        similarity_scores,
        key=lambda x: x[1],
        reverse=True
    )

    recommendations = []

    for index, score in similarity_scores[1:number_of_recommendations + 1]:
        product = data.iloc[index]

        recommendations.append({
            "product": product["product"],
            "category": product["category"],
            "price": int(product["price"]),
            "rating": float(product["rating"]),
            "similarity_score": round(float(score), 2)
        })

    return recommendations


# Test the recommendation system
if __name__ == "__main__":
    product_name = "Fresh Milk"

    recommendations = recommend_products(product_name)

    print(f"\nRecommendations for: {product_name}\n")

    for item in recommendations:
        print(
            f"{item['product']} | "
            f"{item['category']} | "
            f"₹{item['price']} | "
            f"Rating: {item['rating']} | "
            f"Similarity: {item['similarity_score']}"
        )