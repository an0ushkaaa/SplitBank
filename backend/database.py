from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Read the database URL from Docker (or use localhost when running without Docker)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://splitbank:splitbank123@localhost:5432/splitbank"
)

# Engine knows how to connect to PostgreSQL
engine = create_engine(DATABASE_URL)

# Factory that creates a new Session whenever one is needed
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Parent class for all database models (User, Wallet, Transaction, ...)
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()