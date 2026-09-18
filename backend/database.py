import os

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base


Base = declarative_base()
DATABASE_URL = URL.create(
    "postgresql+psycopg2",
    username="smartcartadmin",
    password=os.environ["RDS_PASSWORD"],
    host="smartcart-postgres.c7qy66oeog2v.ap-south-1.rds.amazonaws.com",
    port=5432,
    database="postgres",
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)