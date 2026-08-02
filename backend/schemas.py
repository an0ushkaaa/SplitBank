from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


# ──────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# WALLETS
# ──────────────────────────────────────────

class WalletCreate(BaseModel):
    name: str

class WalletResponse(BaseModel):
    id: UUID
    name: str
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class InviteMember(BaseModel):
    email: str  # invite by email, look up user internally


# ──────────────────────────────────────────
# TRANSACTIONS
# ──────────────────────────────────────────

class DepositRequest(BaseModel):
    amount: float
    note: Optional[str] = None

class SpendRequest(BaseModel):
    amount: float
    note: Optional[str] = None

class TransferRequest(BaseModel):
    amount: float
    target_wallet_id: UUID
    note: Optional[str] = None

class TransactionResponse(BaseModel):
    id: UUID
    wallet_id: UUID
    initiated_by: UUID
    amount: float
    type: str
    flagged: bool
    timestamp: datetime
    note: Optional[str]

    class Config:
        from_attributes = True