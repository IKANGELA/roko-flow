from typing import List, Optional

from app.models.kosztorys import KosztorysDB, PozycjaKosztorysuDB
from app.repositories.dostawca_repository import DostawcaRepository
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.kosztorys import (
    DostawcaPodsumowanie,
    KlientPodsumowanie,
    Kosztorys,
    KosztorysCreate,
    Pozycja,
)

DOMYSLNY_PROCENT_ZALICZKI = 0.4


class KosztorysService:
    """
    Logika biznesowa kosztorysu: wyliczanie sum, VAT, zaliczki i kwoty do dopłaty.

    Kolejność wyliczeń (do ewentualnej korekty, jeśli w praktyce jest inna):
    suma netto pozycji -> (+ dodatkowe koszty - rabat) -> suma netto
    -> (+ VAT) -> suma brutto -> zaliczka (40% albo ustalona ręcznie) -> do dopłaty.
    """

    def __init__(
        self,
        repository: KosztorysRepository,
        klient_repository: KlientRepository,
        zamowienie_repository: ZamowienieRepository,
        montaz_repository: MontazRepository,
        dostawca_repository: DostawcaRepository,
    ) -> None:
        self._repository = repository
        self._klient_repository = klient_repository
        self._zamowienie_repository = zamowienie_repository
        self._montaz_repository = montaz_repository
        self._dostawca_repository = dostawca_repository

    def utworz_kosztorys(self, dane: KosztorysCreate) -> Kosztorys:
        if self._klient_repository.znajdz(dane.klient_id) is None:
            raise ValueError(f"Klient o id={dane.klient_id} nie istnieje")

        kosztorys_db = self._repository.dodaj(dane)
        return self._do_schematu(kosztorys_db)

    def aktualizuj_kosztorys(self, kosztorys_id: int, dane: KosztorysCreate) -> Optional[Kosztorys]:
        if self._klient_repository.znajdz(dane.klient_id) is None:
            raise ValueError(f"Klient o id={dane.klient_id} nie istnieje")

        kosztorys_db = self._repository.aktualizuj(kosztorys_id, dane)
        if kosztorys_db is None:
            return None
        return self._do_schematu(kosztorys_db)

    def lista_kosztorysow(self) -> List[Kosztorys]:
        return [self._do_schematu(k) for k in self._repository.wszystkie()]

    def pobierz_kosztorys(self, kosztorys_id: int) -> Optional[Kosztorys]:
        kosztorys_db = self._repository.znajdz(kosztorys_id)
        if kosztorys_db is None:
            return None
        return self._do_schematu(kosztorys_db)

    def usun_kosztorys(self, kosztorys_id: int) -> bool:
        if self._zamowienie_repository.istnieje_dla_kosztorysu(kosztorys_id):
            raise ValueError("Nie można usunąć kosztorysu — istnieją dla niego zamówienia")
        if self._montaz_repository.istnieje_dla_kosztorysu(kosztorys_id):
            raise ValueError("Nie można usunąć kosztorysu — istnieją dla niego montaże")
        return self._repository.usun(kosztorys_id)

    def _pozycja_do_schematu(self, pozycja: PozycjaKosztorysuDB) -> Pozycja:
        kwoty = [
            pozycja.montaz_kwota,
            pozycja.opis_kwota,
            pozycja.kolor_kwota,
            pozycja.oscieznica_rodzaj_kwota,
            pozycja.informacje_dodatkowe_kwota,
            pozycja.szklo_kwota,
            pozycja.wentylacja_kwota,
            pozycja.uwagi_kwota,
        ]
        suma_netto = sum(kwota for kwota in kwoty if kwota is not None)
        dostawca = (
            self._dostawca_repository.znajdz(pozycja.dostawca_id) if pozycja.dostawca_id is not None else None
        )
        return Pozycja(
            id=pozycja.id,
            nazwa=pozycja.nazwa,
            dostawca_id=pozycja.dostawca_id,
            dostawca=DostawcaPodsumowanie.model_validate(dostawca) if dostawca is not None else None,
            montaz_kwota=pozycja.montaz_kwota,
            opis=pozycja.opis,
            opis_kwota=pozycja.opis_kwota,
            kolor=pozycja.kolor,
            kolor_kwota=pozycja.kolor_kwota,
            oscieznica_rodzaj=pozycja.oscieznica_rodzaj,
            oscieznica_rodzaj_kwota=pozycja.oscieznica_rodzaj_kwota,
            informacje_dodatkowe=pozycja.informacje_dodatkowe,
            informacje_dodatkowe_kwota=pozycja.informacje_dodatkowe_kwota,
            szklo=pozycja.szklo,
            szklo_kwota=pozycja.szklo_kwota,
            wentylacja=pozycja.wentylacja,
            wentylacja_kwota=pozycja.wentylacja_kwota,
            uwagi=pozycja.uwagi,
            uwagi_kwota=pozycja.uwagi_kwota,
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

        klient = self._klient_repository.znajdz(kosztorys.klient_id)

        return Kosztorys(
            id=kosztorys.id,
            klient_id=kosztorys.klient_id,
            klient=KlientPodsumowanie.model_validate(klient),
            numer=kosztorys.numer,
            wersja=kosztorys.wersja,
            nazwa_inwestycji=kosztorys.nazwa_inwestycji,
            adres_nabywcy=kosztorys.adres_nabywcy,
            nip_nabywcy=kosztorys.nip_nabywcy,
            adres_montazu=kosztorys.adres_montazu,
            termin=kosztorys.termin,
            data=kosztorys.data,
            uwagi=kosztorys.uwagi,
            wybrany_do_realizacji=kosztorys.wybrany_do_realizacji,
            ostatnia_aktualizacja=kosztorys.ostatnia_aktualizacja,
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
