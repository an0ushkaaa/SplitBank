from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from schemas import TransactionResponse
from database import get_db
from models import Transaction, User
from auth import get_current_user
from routes.wallets import get_wallet_or_404, get_membership_or_403

router = APIRouter(
    prefix="/wallets",
    tags=["Audit"],
    redirect_slashes=False
)


# ──────────────────────────────────────────
# GET /wallets/{id}/audit
# GET /wallets/{id}/audit?flagged=true
# GET /wallets/{id}/audit?type=spend
# ──────────────────────────────────────────

@router.get("/{wallet_id}/audit", response_model=list[TransactionResponse])
def get_audit_log(
    wallet_id: UUID,
    flagged: Optional[bool] = Query(default=None),
    type: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_wallet_or_404(wallet_id, db)
    get_membership_or_403(wallet_id, current_user.id, db)

    # Start with all transactions for this wallet
    query = db.query(Transaction).filter(
        Transaction.wallet_id == wallet_id
    )

    # Optional filters
    if flagged is not None:
        query = query.filter(Transaction.flagged == flagged)

    if type is not None:
        query = query.filter(Transaction.type == type)

    # Most recent first
    transactions = query.order_by(Transaction.timestamp.desc()).all()

    return transactions