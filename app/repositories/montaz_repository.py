from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.montaz import MontazDB
from app.schemas.montaz import MontazCreate


class MontazRepository:
    """Odpowiada wyłącznie za przechowywanie i odczyt terminów montażu."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def dodaj(self, dane: MontazCreate) -> MontazDB:
        montaz = MontazDB(**dane.model_dump())
        self._db.add(montaz)
        self._db.commit()
        self._db.refresh(montaz)
        return montaz

    def aktualizuj(self, montaz_id: int, dane: MontazCreate) -> Optional[MontazDB]:
        montaz = self.znajdz(montaz_id)
        if montaz is None:
            return None

        for pole, wartosc in dane.model_dump().items():
            setattr(montaz, pole, wartosc)

        self._db.commit()
        self._db.refresh(montaz)
        return montaz

    def wszystkie(self) -> List[MontazDB]:
        return self._db.query(MontazDB).all()

    def znajdz(self, montaz_id: int) -> Optional[MontazDB]:
        return self._db.query(MontazDB).filter(MontazDB.id == montaz_id).first()

    def istnieje_dla_kosztorysu(self, kosztorys_id: int) -> bool:
        return self._db.query(MontazDB).filter(MontazDB.kosztorys_id == kosztorys_id).first() is not None
