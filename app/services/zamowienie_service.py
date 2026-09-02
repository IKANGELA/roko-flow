from typing import List, Optional

from app.models.zamowienie import ZamowienieDB
from app.repositories.dostawca_repository import DostawcaRepository
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.montaz import MontazCreate
from app.schemas.zamowienie import (
    DostawcaPodsumowanie,
    KlientPodsumowanie,
    KosztorysPodsumowanie,
    Zamowienie,
    ZamowienieCreate,
)


class ZamowienieService:
    """Logika biznesowa zamówień: walidacja powiązań i wyliczenie kwoty do dopłaty."""

    def __init__(
        self,
        repository: ZamowienieRepository,
        kosztorys_repository: KosztorysRepository,
        dostawca_repository: DostawcaRepository,
        klient_repository: KlientRepository,
        montaz_repository: MontazRepository,
    ) -> None:
        self._repository = repository
        self._kosztorys_repository = kosztorys_repository
        self._dostawca_repository = dostawca_repository
        self._klient_repository = klient_repository
        self._montaz_repository = montaz_repository

    def _sprawdz_powiazania(self, dane: ZamowienieCreate) -> None:
        # kosztorys_id, klient_id i dostawca_id są opcjonalne (zamówienie "wolne", np. serwis,
        # albo dostawca jeszcze nieznany) — sprawdzamy istnienie tylko gdy podano.
        if dane.kosztorys_id is not None and self._kosztorys_repository.znajdz(dane.kosztorys_id) is None:
            raise ValueError(f"Kosztorys o id={dane.kosztorys_id} nie istnieje")
        if dane.klient_id is not None and self._klient_repository.znajdz(dane.klient_id) is None:
            raise ValueError(f"Klient o id={dane.klient_id} nie istnieje")
        if dane.dostawca_id is not None and self._dostawca_repository.znajdz(dane.dostawca_id) is None:
            raise ValueError(f"Dostawca o id={dane.dostawca_id} nie istnieje")

    def _dodaj_do_montazy_jesli_trzeba(self, dane: ZamowienieCreate) -> None:
        # Zaznaczenie "Dodaj do Montaży" na zamówieniu ma faktycznie utworzyć termin montażu —
        # montaż wisi na kosztorysie, nie na zamówieniu (patrz [[montaz_calendar_sync]]), więc bez
        # kosztorysu nie ma do czego go przypiąć — po cichu pomijamy, to nie błąd zamówienia.
        # Jeśli montaż dla tego kosztorysu już istnieje, nie tworzymy drugiego.
        if not dane.dodaj_do_montazy or dane.kosztorys_id is None:
            return
        if self._montaz_repository.istnieje_dla_kosztorysu(dane.kosztorys_id):
            return
        self._montaz_repository.dodaj(MontazCreate(kosztorys_id=dane.kosztorys_id))

    def utworz_zamowienie(self, dane: ZamowienieCreate) -> Zamowienie:
        self._sprawdz_powiazania(dane)
        zamowienie_db = self._repository.dodaj(dane)
        self._dodaj_do_montazy_jesli_trzeba(dane)
        return self._do_schematu(zamowienie_db)

    def aktualizuj_zamowienie(self, zamowienie_id: int, dane: ZamowienieCreate) -> Optional[Zamowienie]:
        self._sprawdz_powiazania(dane)
        zamowienie_db = self._repository.aktualizuj(zamowienie_id, dane)
        if zamowienie_db is None:
            return None
        self._dodaj_do_montazy_jesli_trzeba(dane)
        return self._do_schematu(zamowienie_db)

    def lista_zamowien(self) -> List[Zamowienie]:
        return [self._do_schematu(z) for z in self._repository.wszystkie()]

    def pobierz_zamowienie(self, zamowienie_id: int) -> Optional[Zamowienie]:
        zamowienie_db = self._repository.znajdz(zamowienie_id)
        if zamowienie_db is None:
            return None
        return self._do_schematu(zamowienie_db)

    def usun_zamowienie(self, zamowienie_id: int) -> bool:
        return self._repository.usun(zamowienie_id)

    def _do_schematu(self, zamowienie: ZamowienieDB) -> Zamowienie:
        if zamowienie.wartosc_netto is None:
            wartosc_brutto = None
            do_doplaty = None
        else:
            wartosc_brutto = round(zamowienie.wartosc_netto * (1 + zamowienie.vat_procent / 100), 2)
            do_doplaty = round(wartosc_brutto - zamowienie.zaliczka_klienta, 2)

        kosztorys_podsumowanie = None
        if zamowienie.kosztorys_id is not None:
            kosztorys = self._kosztorys_repository.znajdz(zamowienie.kosztorys_id)
            klient = self._klient_repository.znajdz(kosztorys.klient_id)
            kosztorys_podsumowanie = KosztorysPodsumowanie(
                id=kosztorys.id,
                numer=kosztorys.numer,
                nazwa_inwestycji=kosztorys.nazwa_inwestycji,
                klient=KlientPodsumowanie.model_validate(klient),
            )

        klient = (
            self._klient_repository.znajdz(zamowienie.klient_id) if zamowienie.klient_id is not None else None
        )
        dostawca = (
            self._dostawca_repository.znajdz(zamowienie.dostawca_id)
            if zamowienie.dostawca_id is not None
            else None
        )
        return Zamowienie(
            id=zamowienie.id,
            kosztorys_id=zamowienie.kosztorys_id,
            kosztorys=kosztorys_podsumowanie,
            klient_id=zamowienie.klient_id,
            klient=KlientPodsumowanie.model_validate(klient) if klient is not None else None,
            dostawca_id=zamowienie.dostawca_id,
            dostawca=DostawcaPodsumowanie.model_validate(dostawca) if dostawca is not None else None,
            status=zamowienie.status,
            status_zamowienia_dostawcy=zamowienie.status_zamowienia_dostawcy,
            adres_nabywcy=zamowienie.adres_nabywcy,
            nip_nabywcy=zamowienie.nip_nabywcy,
            adres_montazu=zamowienie.adres_montazu,
            numer_zamowienia=zamowienie.numer_zamowienia,
            data_zamowienia=zamowienie.data_zamowienia,
            termin_realizacji_tygodnie=zamowienie.termin_realizacji_tygodnie,
            uwagi=zamowienie.uwagi,
            data_dostawy=zamowienie.data_dostawy,
            magazyn=zamowienie.magazyn,
            braki_w_dostawie=zamowienie.braki_w_dostawie,
            zaliczka_producent=zamowienie.zaliczka_producent,
            doplata_producent=zamowienie.doplata_producent,
            wartosc_netto=zamowienie.wartosc_netto,
            vat_procent=zamowienie.vat_procent,
            wartosc_brutto=wartosc_brutto,
            zaliczka_klienta=zamowienie.zaliczka_klienta,
            data_zaliczki=zamowienie.data_zaliczki,
            doplacono=zamowienie.doplacono,
            dodaj_do_montazy=zamowienie.dodaj_do_montazy,
            do_doplaty=do_doplaty,
        )
