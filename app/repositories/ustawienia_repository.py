from sqlalchemy.orm import Session

from app.models.ustawienia import UstawieniaFirmyDB
from app.schemas.ustawienia import UstawieniaFirmy

# Ustawienia firmy to singleton — zawsze dokładnie jeden wiersz, o tym stałym id.
ID_SINGLETONA = 1


class UstawieniaRepository:
    """Odpowiada wyłącznie za przechowywanie i odczyt (jedynego) wiersza ustawień firmy."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def pobierz(self) -> UstawieniaFirmyDB:
        ustawienia = self._db.query(UstawieniaFirmyDB).filter(UstawieniaFirmyDB.id == ID_SINGLETONA).first()
        if ustawienia is None:
            # Pierwsze uruchomienie — jeszcze nikt nic nie zapisał, tworzymy pusty wiersz.
            ustawienia = UstawieniaFirmyDB(id=ID_SINGLETONA)
            self._db.add(ustawienia)
            self._db.commit()
            self._db.refresh(ustawienia)
        return ustawienia

    def aktualizuj(self, dane: UstawieniaFirmy) -> UstawieniaFirmyDB:
        ustawienia = self.pobierz()
        for pole, wartosc in dane.model_dump().items():
            setattr(ustawienia, pole, wartosc)
        self._db.commit()
        self._db.refresh(ustawienia)
        return ustawienia
