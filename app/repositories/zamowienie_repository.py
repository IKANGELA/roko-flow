from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.zamowienie import ZamowienieDB
from app.schemas.zamowienie import ZamowienieCreate


class ZamowienieRepository:
    """Odpowiada wyłącznie za przechowywanie i odczyt zamówień."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def dodaj(self, dane: ZamowienieCreate) -> ZamowienieDB:
        zamowienie = ZamowienieDB(**dane.model_dump())
        self._db.add(zamowienie)
        self._db.commit()
        self._db.refresh(zamowienie)
        return zamowienie

    def aktualizuj(self, zamowienie_id: int, dane: ZamowienieCreate) -> Optional[ZamowienieDB]:
        zamowienie = self.znajdz(zamowienie_id)
        if zamowienie is None:
            return None

        for pole, wartosc in dane.model_dump().items():
            setattr(zamowienie, pole, wartosc)

        self._db.commit()
        self._db.refresh(zamowienie)
        return zamowienie

    def wszystkie(self) -> List[ZamowienieDB]:
        return self._db.query(ZamowienieDB).all()

    def znajdz(self, zamowienie_id: int) -> Optional[ZamowienieDB]:
        return self._db.query(ZamowienieDB).filter(ZamowienieDB.id == zamowienie_id).first()
