from fastapi import FastAPI
from database import Base, engine
import models
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.wallets import router as wallets_router
from routes.transactions import router as transactions_router
from routes.audit import router as audit_router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(wallets_router)
app.include_router(transactions_router)
app.include_router(audit_router)

@app.get("/health")
def health():
    return {"status": "OK"}