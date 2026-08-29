from typing import List, Optional

from app.models.kosztorys import KosztorysDB, PozycjaKosztorysuDB
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.schemas.kosztorys import Kosztorys, KosztorysCreate, Pozycja, Skladnik

DOMYSLNY_PROCENT_ZALICZKI = 0.4


class KosztorysService:
    """
    Logika biznesowa kosztorysu: wyliczanie sum, VAT, zaliczki i kwoty do dopłaty.

    Kolejność wyliczeń (do ewentualnej korekty, jeśli w praktyce jest inna):
    suma netto pozycji -> (+ dodatkowe koszty - rabat) -> suma netto
    -> (+ VAT) -> suma brutto -> zaliczka (40% albo ustalona ręcznie) -> do dopłaty.
    """

    def __init__(self, repository: KosztorysRepository, klient_repository: KlientRepository) -> None:
        self._repository = repository
        self._klient_repository = klient_repository

    def utworz_kosztorys(self, dane: KosztorysCreate) -> Kosztorys:
        if self._klient_repository.znajdz(dane.klient_id) is None:
            raise ValueError(f"Klient o id={dane.klient_id} nie istnieje")

        kosztorys_db = self._repository.dodaj(dane)
        return self._do_schematu(kosztorys_db)

    def lista_kosztorysow(self) -> List[Kosztorys]:
        return [self._do_schematu(k) for k in self._repository.wszystkie()]

    def pobierz_kosztorys(self, kosztorys_id: int) -> Optional[Kosztorys]:
        kosztorys_db = self._repository.znajdz(kosztorys_id)
        if kosztorys_db is None:
            return None
        return self._do_schematu(kosztorys_db)

    def _pozycja_do_schematu(self, pozycja: PozycjaKosztorysuDB) -> Pozycja:
        suma_netto = sum(skladnik.kwota for skladnik in pozycja.skladniki)
        return Pozycja(
            id=pozycja.id,
            nazwa=pozycja.nazwa,
            opis=pozycja.opis,
            kolor=pozycja.kolor,
            oscieznica_rodzaj=pozycja.oscieznica_rodzaj,
            informacje_dodatkowe=pozycja.informacje_dodatkowe,
            szklo=pozycja.szklo,
            wentylacja=pozycja.wentylacja,
            uwagi=pozycja.uwagi,
            skladniki=[Skladnik.model_validate(s) for s in pozycja.skladniki],
            suma_netto=suma_netto,
        )

    def _do_schematu(self, kosztorys: KosztorysDB) -> Kosztorys:
        pozycje = [self._pozycja_do_schematu(p) for p in kosztorys.pozycje]

        suma_netto_pozycji = sum(p.suma_netto for p in pozycje)
        suma_netto = suma_netto_pozycji + kosztorys.dodatkowe_koszty - kosztorys.rabat
        suma_brutto = round(suma_netto * (1 + kosztorys.vat_procent / 100), 2)

        if kosztorys.ustalona_zaliczka is not None:
            zaliczka = kosztorys.ustalona_zaliczka
        else:
            zaliczka = round(suma_brutto * DOMYSLNY_PROCENT_ZALICZKI, 2)

        do_doplaty = round(suma_brutto - zaliczka, 2)

        return Kosztorys(
            id=kosztorys.id,
            klient_id=kosztorys.klient_id,
            numer=kosztorys.numer,
            wersja=kosztorys.wersja,
            nazwa_inwestycji=kosztorys.nazwa_inwestycji,
            adres_montazu=kosztorys.adres_montazu,
            termin=kosztorys.termin,
            data=kosztorys.data,
            vat_procent=kosztorys.vat_procent,
            dodatkowe_koszty=kosztorys.dodatkowe_koszty,
            rabat=kosztorys.rabat,
            ustalona_zaliczka=kosztorys.ustalona_zaliczka,
            pozycje=pozycje,
            suma_netto_pozycji=suma_netto_pozycji,
            suma_netto=suma_netto,
            suma_brutto=suma_brutto,
            zaliczka=zaliczka,
            do_doplaty=do_doplaty,
        )
