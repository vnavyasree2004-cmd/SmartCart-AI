from fastapi import FastAPI, Depends, HTTPException, status
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from ml.recommendation import recommend_products

from database import Base, engine, SessionLocal
from models import (
    Product as ProductModel,
    User as UserModel,
    CartItem as CartItemModel,
    Order as OrderModel,
    OrderItem as OrderItemModel
)

from models import (
    Product as ProductModel,
    User as UserModel,
    CartItem as CartItemModel,
    Order as OrderModel
) 


app = FastAPI()

Base.metadata.create_all(bind=engine)


# ---------------- SECURITY ----------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = "smartcart-ai-secret-key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ---------------- SCHEMAS ----------------


class Product(BaseModel):
    name: str
    price: int
    category: str
    image: str


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: int


class OrderCreate(BaseModel):
    total_amount: int
    items: list[OrderItemCreate]


# ---------------- CORS ----------------


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- HOME ----------------


@app.get("/")
def home():
    return {
        "message": "Welcome to SmartCart AI Backend"
    }


# ---------------- PRODUCTS ----------------


# ---------------- PRODUCTS ----------------


@app.get("/products")
def get_products():
    db = SessionLocal()

    products = db.query(ProductModel).all()

    result = [
        {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": product.category,
            "image": product.image
        }
        for product in products
    ]

    db.close()

    return result


@app.post("/products")
def add_product(product: Product):
    db = SessionLocal()

    new_product = ProductModel(
        name=product.name,
        price=product.price,
        category=product.category,
        image=product.image
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    db.close()

    return {
        "message": "Product added successfully",
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "price": new_product.price,
            "category": new_product.category,
            "image": new_product.image
        }
    }


@app.put("/products/{product_name}")
def update_product(product_name: str, product: Product):
    db = SessionLocal()

    existing_product = db.query(ProductModel).filter(
        ProductModel.name == product_name
    ).first()

    if not existing_product:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing_product.name = product.name
    existing_product.price = product.price
    existing_product.category = product.category
    existing_product.image = product.image

    db.commit()
    db.refresh(existing_product)

    db.close()

    return {
        "message": "Product updated successfully",
        "product": {
            "id": existing_product.id,
            "name": existing_product.name,
            "price": existing_product.price,
            "category": existing_product.category,
            "image": existing_product.image
        }
    }


@app.delete("/products/{product_name}")
def delete_product(product_name: str):
    db = SessionLocal()

    existing_product = db.query(ProductModel).filter(
        ProductModel.name == product_name
    ).first()

    if not existing_product:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(existing_product)
    db.commit()

    db.close()

    return {
        "message": "Product deleted successfully",
        "product_name": product_name
    }


# ---------------- USER REGISTRATION ----------------


@app.post("/register")
def register_user(user: UserCreate):
    db = SessionLocal()

    existing_user = db.query(UserModel).filter(
        UserModel.email == user.email
    ).first()

    if existing_user:
        db.close()
        return {
            "message": "Email already registered"
        }
    if len(user.password) < 8:
     raise HTTPException(
        status_code=400,
        detail="Password must be at least 8 characters"
    )

    hashed_password = pwd_context.hash(user.password)

    new_user = UserModel(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


# ---------------- USER LOGIN + JWT ----------------


@app.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    db = SessionLocal()

    existing_user = db.query(UserModel).filter(
        UserModel.email == form_data.username
    ).first()

    if not existing_user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(
        form_data.password,
        existing_user.password
    ):
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token_data = {
        "sub": str(existing_user.id),
        "email": existing_user.email
    }

    access_token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    db.close()

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ---------------- JWT AUTHENTICATION ----------------


def verify_token(
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if user_id is None or email is None:
            raise credentials_exception

        return payload

    except JWTError:
        raise credentials_exception


# ---------------- PROTECTED PROFILE ----------------


@app.get("/profile")
def get_profile(
    token_data: dict = Depends(verify_token)
):
    return {
        "message": "You are authenticated",
        "user_id": token_data["sub"],
        "email": token_data["email"]
    }


# ---------------- PROTECTED ORDERS ----------------



@app.get("/orders")
def get_orders(
    token_data: dict = Depends(verify_token)
):
    db = SessionLocal()

    orders = db.query(OrderModel).filter(
        OrderModel.user_id == int(token_data["sub"])
    ).all()

    result = [
        {
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status
        }
        for order in orders
    ]

    db.close()

    return {
        "user_id": token_data["sub"],
        "orders": result
    }


@app.post("/orders")
def create_order(
    order: OrderCreate,
    token_data: dict = Depends(verify_token)
):
    db = SessionLocal()

    user_id = int(token_data["sub"])

    new_order = OrderModel(
        user_id=user_id,
        total_amount=order.total_amount,
        status="Order Confirmed"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        new_order_item = OrderItemModel(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )

        db.add(new_order_item)

    db.commit()

    # Clear user's cart after successful order
    db.query(CartItemModel).filter(
        CartItemModel.user_id == user_id
    ).delete(synchronize_session=False)

    db.commit()

    order_id = new_order.id
    total_amount = new_order.total_amount
    status = new_order.status

    db.close()

    return {
        "message": "Order created successfully",
        "order": {
            "id": order_id,
            "user_id": user_id,
            "total_amount": total_amount,
            "status": status
        },
        "items": order.items
    }

# ---------------- PROTECTED CART ----------------


@app.post("/cart")
def add_to_cart(
    cart_item: CartItemCreate,
    token_data: dict = Depends(verify_token)
):
    db = SessionLocal()

    new_cart_item = CartItemModel(
        user_id=int(token_data["sub"]),
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )

    db.add(new_cart_item)
    db.commit()
    db.refresh(new_cart_item)

    db.close()

    return {
        "message": "Item added to cart successfully",
        "cart_item": {
            "id": new_cart_item.id,
            "user_id": new_cart_item.user_id,
            "product_id": new_cart_item.product_id,
            "quantity": new_cart_item.quantity
        }
    }

@app.put("/cart/{product_id}")
def update_cart_item(
    product_id: int,
    quantity: int,
    token_data: dict = Depends(verify_token)
):
    db = SessionLocal()

    cart_item = db.query(CartItemModel).filter(
        CartItemModel.user_id == int(token_data["sub"]),
        CartItemModel.product_id == product_id
    ).first()

    if not cart_item:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    cart_item.quantity = quantity
    db.commit()
    db.refresh(cart_item)

    result = {
        "id": cart_item.id,
        "user_id": cart_item.user_id,
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity
    }

    db.close()

    return {
        "message": "Cart item updated successfully",
        "cart_item": result
    }


@app.get("/cart")
def get_cart(
    token_data: dict = Depends(verify_token)
):
    db = SessionLocal()

    cart_items = db.query(CartItemModel).filter(
        CartItemModel.user_id == int(token_data["sub"])
    ).all()

    result = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity
        }
        for item in cart_items
    ]

    db.close()

    return {
        "user_id": token_data["sub"],
        "cart": result
    }

@app.delete("/cart/{product_id}")
def delete_cart_item(
    product_id: int,
    token_data: dict = Depends(verify_token)
):
    db = SessionLocal()

    cart_item = db.query(CartItemModel).filter(
        CartItemModel.user_id == int(token_data["sub"]),
        CartItemModel.product_id == product_id
    ).first()

    if not cart_item:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    db.close()

    return {
        "message": "Cart item removed successfully"
    }
@app.get("/recommendations/{product_name}")
def get_recommendations(product_name: str):
    recommendations = recommend_products(product_name)

    if not recommendations:
        return {
            "message": "Product not found",
            "recommendations": []
        }

    return {
        "product": product_name,
        "recommendations": recommendations
    }