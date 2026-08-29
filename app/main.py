from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import dostawca, klient, kosztorys, montaz, zamowienie  # noqa: F401 -- rejestruje tabele w Base
from app.routers import dostawcy, klienci, kosztorysy, montaze, zamowienia

# Tworzy w bazie danych tabele dla wszystkich zaimportowanych modeli (jeśli jeszcze nie istnieją).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ROKO Flow")

# Pozwala frontendowi (React na localhost:5173) wysyłać zapytania do tego API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(klienci.router)
app.include_router(dostawcy.router)
app.include_router(kosztorysy.router)
app.include_router(zamowienia.router)
app.include_router(montaze.router)


@app.get("/")
def read_root():
    return {"message": "ROKO Flow działa!"}
