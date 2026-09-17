from database import SessionLocal
from models import Product

db = SessionLocal()

products = [
    Product(
        name="Fresh Apples",
        price=120,
        category="Fruits",
        image="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6"
    ),
    Product(
        name="Fresh Milk",
        price=60,
        category="Dairy",
        image="https://images.unsplash.com/photo-1563636619-e9143da7973b"
    ),
    Product(
        name="Fresh Bread",
        price=45,
        category="Bakery",
        image="https://images.unsplash.com/photo-1509440159596-0249088772ff"
    )
]

db.add_all(products)
db.commit()
db.close()

print("Products added successfully")