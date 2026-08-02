import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from database import Base


# ──────────────────────────────────────────
# ENUMS
# ──────────────────────────────────────────

class RoleEnum(str, enum.Enum):
    owner = "owner"
    member = "member"

class TransactionTypeEnum(str, enum.Enum):
    deposit = "deposit"
    spend = "spend"
    transfer = "transfer"


# ──────────────────────────────────────────
# MODELS
# ──────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    balance = Column(Numeric(12, 2), default=0)
    created_at = Column(DateTime, server_default=func.now())

    members = relationship("WalletMember", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")


class WalletMember(Base):
    __tablename__ = "wallet_members"

    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    role = Column(Enum(RoleEnum), nullable=False)
    joined_at = Column(DateTime, server_default=func.now())

    wallet = relationship("Wallet", back_populates="members")
    user = relationship("User")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=False)
    initiated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(Enum(TransactionTypeEnum), nullable=False)
    flagged = Column(Boolean, default=False)
    timestamp = Column(DateTime, server_default=func.now())
    note = Column(String, nullable=True)

    wallet = relationship("Wallet", back_populates="transactions")
    initiator = relationship("User")