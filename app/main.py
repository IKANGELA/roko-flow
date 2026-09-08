from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, SessionLocal, engine
from app.models import dostawca, klient, kosztorys, montaz, ustawienia, zamowienie  # noqa: F401 -- rejestruje tabele w Base
from app.routers import dostawcy, klienci, kosztorysy, montaze, ustawienia as ustawienia_router, zamowienia
from app.seed_demo import zasiej_dane_demo_jesli_puste

# Tworzy w bazie danych tabele dla wszystkich zaimportowanych modeli (jeśli jeszcze nie istnieją).
Base.metadata.create_all(bind=engine)

# Na demo (Render, baza resetuje się przy każdym restarcie — to tu celowe, patrz
# app/seed_demo.py) wypełnia pustą bazę przykładowymi, fikcyjnymi danymi. Lokalnie na
# realnych danych nic nie robi — funkcja od razu kończy, jeśli klienci już istnieją.
with SessionLocal() as _sesja_startowa:
    zasiej_dane_demo_jesli_puste(_sesja_startowa)

app = FastAPI(title="ROKO Flow")

# Pozwala frontendowi wysyłać zapytania do tego API — localhost do pracy lokalnej,
# GitHub Pages do publicznego demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://ikangela.github.io"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(klienci.router)
app.include_router(dostawcy.router)
app.include_router(kosztorysy.router)
app.include_router(zamowienia.router)
app.include_router(montaze.router)
app.include_router(ustawienia_router.router)


@app.get("/")
def read_root():
    return {"message": "ROKO Flow działa!"}
