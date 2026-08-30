from datetime import datetime
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
                dostawca_id=pozycja.dostawca_id,
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

    def _kolejny_numer(self) -> str:
        """Generuje kolejny unikatowy numer kosztorysu w formacie K_01, K_02, ..."""
        istniejace_numery = [numer for (numer,) in self._db.query(KosztorysDB.numer).all()]
        maks = 0
        for numer in istniejace_numery:
            if numer and numer.startswith("K_"):
                try:
                    maks = max(maks, int(numer[2:]))
                except ValueError:
                    continue
        return f"K_{maks + 1:02d}"

    def dodaj(self, dane: KosztorysCreate) -> KosztorysDB:
        kosztorys = KosztorysDB(
            klient_id=dane.klient_id,
            numer=self._kolejny_numer(),
            wersja=dane.wersja,
            nazwa_inwestycji=dane.nazwa_inwestycji,
            adres_montazu=dane.adres_montazu,
            termin=dane.termin,
            uwagi=dane.uwagi,
            wybrany_do_realizacji=dane.wybrany_do_realizacji,
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

        # numer NIE jest tu nadpisywany — jest nadawany raz, przy utworzeniu, i pozostaje stały.
        kosztorys.klient_id = dane.klient_id
        kosztorys.wersja = dane.wersja
        kosztorys.nazwa_inwestycji = dane.nazwa_inwestycji
        kosztorys.adres_montazu = dane.adres_montazu
        kosztorys.termin = dane.termin
        kosztorys.uwagi = dane.uwagi
        kosztorys.wybrany_do_realizacji = dane.wybrany_do_realizacji
        kosztorys.vat_procent = dane.vat_procent
        kosztorys.dodatkowe_koszty = dane.dodatkowe_koszty
        kosztorys.rabat = dane.rabat
        kosztorys.ustalona_zaliczka = dane.ustalona_zaliczka
        kosztorys.ostatnia_aktualizacja = datetime.utcnow()

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

    def usun(self, kosztorys_id: int) -> bool:
        # .znajdz() bez joinedload wystarczy — samo usunięcie i tak kaskadowo skasuje pozycje/składniki.
        kosztorys = self._db.query(KosztorysDB).filter(KosztorysDB.id == kosztorys_id).first()
        if kosztorys is None:
            return False
        self._db.delete(kosztorys)
        self._db.commit()
        return True

    def istnieje_dla_klienta(self, klient_id: int) -> bool:
        return self._db.query(KosztorysDB).filter(KosztorysDB.klient_id == klient_id).first() is not None
