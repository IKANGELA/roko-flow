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

    def usun(self, zamowienie_id: int) -> bool:
        zamowienie = self.znajdz(zamowienie_id)
        if zamowienie is None:
            return False
        self._db.delete(zamowienie)
        self._db.commit()
        return True

    def istnieje_dla_kosztorysu(self, kosztorys_id: int) -> bool:
        return self._db.query(ZamowienieDB).filter(ZamowienieDB.kosztorys_id == kosztorys_id).first() is not None

    def istnieje_dla_dostawcy(self, dostawca_id: int) -> bool:
        return self._db.query(ZamowienieDB).filter(ZamowienieDB.dostawca_id == dostawca_id).first() is not None
