from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.dostawca import DostawcaDB
from app.schemas.dostawca import DostawcaCreate


class DostawcaRepository:
    """Odpowiada wyłącznie za przechowywanie i odczyt danych dostawców — teraz w bazie SQLite."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def dodaj(self, dane: DostawcaCreate) -> DostawcaDB:
        dostawca = DostawcaDB(**dane.model_dump())
        self._db.add(dostawca)
        self._db.commit()
        self._db.refresh(dostawca)
        return dostawca

    def wszyscy(self) -> List[DostawcaDB]:
        return self._db.query(DostawcaDB).all()

    def znajdz(self, dostawca_id: int) -> Optional[DostawcaDB]:
        return self._db.query(DostawcaDB).filter(DostawcaDB.id == dostawca_id).first()
