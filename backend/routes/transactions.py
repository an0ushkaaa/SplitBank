from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from decimal import Decimal
from database import get_db
from models import Wallet, WalletMember, Transaction, TransactionTypeEnum, User
from schemas import DepositRequest, SpendRequest, TransferRequest, TransactionResponse
from auth import get_current_user
from routes.wallets import get_wallet_or_404, get_membership_or_403

router = APIRouter(
    prefix="/wallets",
    tags=["Transactions"],
    redirect_slashes=False
)


# ──────────────────────────────────────────
# POST /wallets/{id}/deposit
# ──────────────────────────────────────────

@router.post("/{wallet_id}/deposit", response_model=TransactionResponse)
def deposit(
    wallet_id: UUID,
    body: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    wallet = get_wallet_or_404(wallet_id, db)
    get_membership_or_403(wallet_id, current_user.id, db)

    # Add to balance
    wallet.balance += Decimal(str(body.amount))

    # Record transaction
    txn = Transaction(
        wallet_id=wallet_id,
        initiated_by=current_user.id,
        amount=body.amount,
        type=TransactionTypeEnum.deposit,
        flagged=False,
        note=body.note
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)  
    return txn

    


# ──────────────────────────────────────────
# POST /wallets/{id}/spend
# ──────────────────────────────────────────

@router.post("/{wallet_id}/spend", response_model=TransactionResponse)
def spend(
    wallet_id: UUID,
    body: SpendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    wallet = get_wallet_or_404(wallet_id, db)
    get_membership_or_403(wallet_id, current_user.id, db)

    # Can't spend more than what's in the wallet
    if body.amount > wallet.balance:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # Deduct from balance
    wallet.balance -= Decimal(str(body.amount))

    # Record transaction
    txn = Transaction(
        wallet_id=wallet_id,
        initiated_by=current_user.id,
        amount=body.amount,
        type=TransactionTypeEnum.spend,
        flagged=False,
        note=body.note
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)  
    return txn
    


# ──────────────────────────────────────────
# POST /wallets/{id}/transfer
# ──────────────────────────────────────────

@router.post("/{wallet_id}/transfer", response_model=TransactionResponse)
def transfer(
    wallet_id: UUID,
    body: TransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    if wallet_id == body.target_wallet_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to the same wallet")

    # Validate source wallet + membership
    source_wallet = get_wallet_or_404(wallet_id, db)
    get_membership_or_403(wallet_id, current_user.id, db)

    # Validate target wallet exists
    target_wallet = get_wallet_or_404(body.target_wallet_id, db)

    # Check balance
    if body.amount > source_wallet.balance:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    # Move the funds
    source_wallet.balance -= Decimal(str(body.amount))
    target_wallet.balance += Decimal(str(body.amount))

    # Record transaction on source wallet
    txn = Transaction(
        wallet_id=wallet_id,
        initiated_by=current_user.id,
        amount=body.amount,
        type=TransactionTypeEnum.transfer,
        flagged=False,
        note=body.note
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)  
    return txn
    