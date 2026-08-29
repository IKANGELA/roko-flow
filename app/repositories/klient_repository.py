from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.klient import KlientDB
from app.schemas.klient import KlientCreate


class KlientRepository:
    """Odpowiada wyłącznie za przechowywanie i odczyt danych klientów — teraz w bazie SQLite."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def dodaj(self, dane: KlientCreate) -> KlientDB:
        klient = KlientDB(**dane.model_dump())
        self._db.add(klient)
        self._db.commit()
        self._db.refresh(klient)
        return klient

    def wszyscy(self) -> List[KlientDB]:
        return self._db.query(KlientDB).all()

    def znajdz(self, klient_id: int) -> Optional[KlientDB]:
        return self._db.query(KlientDB).filter(KlientDB.id == klient_id).first()
