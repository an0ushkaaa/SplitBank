from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models import Wallet, WalletMember, User, RoleEnum
from schemas import WalletCreate, WalletResponse, InviteMember
from auth import get_current_user

router = APIRouter(
    prefix="/wallets",
    tags=["Wallets"],
    redirect_slashes=False
)

def get_wallet_or_404(wallet_id: UUID, db: Session):
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

def get_membership_or_403(wallet_id: UUID, user_id: UUID, db: Session):
    membership = db.query(WalletMember).filter(
        WalletMember.wallet_id == wallet_id,
        WalletMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this wallet")
    return membership

@router.get("", response_model=list[WalletResponse])
def list_wallets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(WalletMember).filter(
        WalletMember.user_id == current_user.id
    ).all()
    wallet_ids = [m.wallet_id for m in memberships]
    wallets = db.query(Wallet).filter(Wallet.id.in_(wallet_ids)).all()
    return wallets

@router.post("", response_model=WalletResponse)
def create_wallet(
    body: WalletCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_wallet = Wallet(
        name=body.name,
        created_by=current_user.id,
        balance=0
    )
    db.add(new_wallet)
    db.flush()
    membership = WalletMember(
        wallet_id=new_wallet.id,
        user_id=current_user.id,
        role=RoleEnum.owner
    )
    db.add(membership)
    db.commit()
    db.refresh(new_wallet)
    return new_wallet

@router.get("/{wallet_id}", response_model=WalletResponse)
def get_wallet(
    wallet_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = get_wallet_or_404(wallet_id, db)
    get_membership_or_403(wallet_id, current_user.id, db)
    return wallet

@router.post("/{wallet_id}/invite")
def invite_member(
    wallet_id: UUID,
    body: InviteMember,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_wallet_or_404(wallet_id, db)
    membership = get_membership_or_403(wallet_id, current_user.id, db)
    if membership.role != RoleEnum.owner:
        raise HTTPException(status_code=403, detail="Only the owner can invite members")
    target_user = db.query(User).filter(User.email == body.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="No user found with that email")
    already_member = db.query(WalletMember).filter(
        WalletMember.wallet_id == wallet_id,
        WalletMember.user_id == target_user.id
    ).first()
    if already_member:
        raise HTTPException(status_code=400, detail="User is already a member")
    new_member = WalletMember(
        wallet_id=wallet_id,
        user_id=target_user.id,
        role=RoleEnum.member
    )
    db.add(new_member)
    db.commit()
    return {"message": f"{target_user.name} added to wallet"}

@router.delete("/{wallet_id}/members/{user_id}")
def remove_member(
    wallet_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_wallet_or_404(wallet_id, db)
    membership = get_membership_or_403(wallet_id, current_user.id, db)
    if membership.role != RoleEnum.owner:
        raise HTTPException(status_code=403, detail="Only the owner can remove members")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Owner cannot remove themselves")
    target_membership = db.query(WalletMember).filter(
        WalletMember.wallet_id == wallet_id,
        WalletMember.user_id == user_id
    ).first()
    if not target_membership:
        raise HTTPException(status_code=404, detail="That user is not a member of this wallet")
    db.delete(target_membership)
    db.commit()
    return {"message": "Member removed"}