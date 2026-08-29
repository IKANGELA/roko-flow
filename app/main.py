from fastapi import FastAPI

from app.core.database import Base, engine
from app.models import dostawca, klient  # noqa: F401 -- import rejestruje tabele w Base
from app.routers import dostawcy, klienci

# Tworzy w bazie danych tabele dla wszystkich zaimportowanych modeli (jeśli jeszcze nie istnieją).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ROKO Flow")

app.include_router(klienci.router)
app.include_router(dostawcy.router)


@app.get("/")
def read_root():
    return {"message": "ROKO Flow działa!"}
