from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.kosztorys import KosztorysDB, PozycjaKosztorysuDB, SkladnikPozycjiDB
from app.schemas.kosztorys import KosztorysCreate, PozycjaCreate


class KosztorysRepository:
    """Odpowiada wyłącznie za przechowywanie i odczyt kosztorysów (razem z pozycjami i składnikami)."""

    def __init__(self, db: Session) -> None:
        self._db = db

    @staticmethod
    def _zbuduj_pozycje(pozycje: List[PozycjaCreate]) -> List[PozycjaKosztorysuDB]:
        return [
            PozycjaKosztorysuDB(
                nazwa=pozycja.nazwa,
                opis=pozycja.opis,
                kolor=pozycja.kolor,
                oscieznica_rodzaj=pozycja.oscieznica_rodzaj,
                informacje_dodatkowe=pozycja.informacje_dodatkowe,
                szklo=pozycja.szklo,
                wentylacja=pozycja.wentylacja,
                uwagi=pozycja.uwagi,
                skladniki=[
                    SkladnikPozycjiDB(opis=skladnik.opis, kwota=skladnik.kwota)
                    for skladnik in pozycja.skladniki
                ],
            )
            for pozycja in pozycje
        ]

    def dodaj(self, dane: KosztorysCreate) -> KosztorysDB:
        kosztorys = KosztorysDB(
            klient_id=dane.klient_id,
            numer=dane.numer,
            wersja=dane.wersja,
            nazwa_inwestycji=dane.nazwa_inwestycji,
            adres_montazu=dane.adres_montazu,
            termin=dane.termin,
            vat_procent=dane.vat_procent,
            dodatkowe_koszty=dane.dodatkowe_koszty,
            rabat=dane.rabat,
            ustalona_zaliczka=dane.ustalona_zaliczka,
            pozycje=self._zbuduj_pozycje(dane.pozycje),
        )
        self._db.add(kosztorys)
        self._db.commit()
        self._db.refresh(kosztorys)
        return kosztorys

    def aktualizuj(self, kosztorys_id: int, dane: KosztorysCreate) -> Optional[KosztorysDB]:
        kosztorys = self.znajdz(kosztorys_id)
        if kosztorys is None:
            return None

        kosztorys.klient_id = dane.klient_id
        kosztorys.numer = dane.numer
        kosztorys.wersja = dane.wersja
        kosztorys.nazwa_inwestycji = dane.nazwa_inwestycji
        kosztorys.adres_montazu = dane.adres_montazu
        kosztorys.termin = dane.termin
        kosztorys.vat_procent = dane.vat_procent
        kosztorys.dodatkowe_koszty = dane.dodatkowe_koszty
        kosztorys.rabat = dane.rabat
        kosztorys.ustalona_zaliczka = dane.ustalona_zaliczka

        # Podmiana całej listy pozycji. cascade="all, delete-orphan" (patrz app/models/kosztorys.py)
        # sprawia, że stare pozycje i ich składniki są automatycznie usuwane z bazy.
        kosztorys.pozycje = self._zbuduj_pozycje(dane.pozycje)

        self._db.commit()
        self._db.refresh(kosztorys)
        return kosztorys

    def wszystkie(self) -> List[KosztorysDB]:
        return (
            self._db.query(KosztorysDB)
            .options(joinedload(KosztorysDB.pozycje).joinedload(PozycjaKosztorysuDB.skladniki))
            .all()
        )

    def znajdz(self, kosztorys_id: int) -> Optional[KosztorysDB]:
        return (
            self._db.query(KosztorysDB)
            .options(joinedload(KosztorysDB.pozycje).joinedload(PozycjaKosztorysuDB.skladniki))
            .filter(KosztorysDB.id == kosztorys_id)
            .first()
        )
