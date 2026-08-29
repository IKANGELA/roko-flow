from typing import List, Optional

from app.models.zamowienie import ZamowienieDB
from app.repositories.dostawca_repository import DostawcaRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.zamowienie import Zamowienie, ZamowienieCreate


class ZamowienieService:
    """Logika biznesowa zamówień: walidacja powiązań i wyliczenie kwoty do dopłaty."""

    def __init__(
        self,
        repository: ZamowienieRepository,
        kosztorys_repository: KosztorysRepository,
        dostawca_repository: DostawcaRepository,
    ) -> None:
        self._repository = repository
        self._kosztorys_repository = kosztorys_repository
        self._dostawca_repository = dostawca_repository

    def _sprawdz_powiazania(self, dane: ZamowienieCreate) -> None:
        if self._kosztorys_repository.znajdz(dane.kosztorys_id) is None:
            raise ValueError(f"Kosztorys o id={dane.kosztorys_id} nie istnieje")
        if self._dostawca_repository.znajdz(dane.dostawca_id) is None:
            raise ValueError(f"Dostawca o id={dane.dostawca_id} nie istnieje")

    def utworz_zamowienie(self, dane: ZamowienieCreate) -> Zamowienie:
        self._sprawdz_powiazania(dane)
        zamowienie_db = self._repository.dodaj(dane)
        return self._do_schematu(zamowienie_db)

    def aktualizuj_zamowienie(self, zamowienie_id: int, dane: ZamowienieCreate) -> Optional[Zamowienie]:
        self._sprawdz_powiazania(dane)
        zamowienie_db = self._repository.aktualizuj(zamowienie_id, dane)
        if zamowienie_db is None:
            return None
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

    @staticmethod
    def _do_schematu(zamowienie: ZamowienieDB) -> Zamowienie:
        do_doplaty = round(zamowienie.wartosc_brutto - zamowienie.zaliczka_klienta, 2)
        return Zamowienie(
            id=zamowienie.id,
            kosztorys_id=zamowienie.kosztorys_id,
            dostawca_id=zamowienie.dostawca_id,
            status=zamowienie.status,
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
            wartosc_brutto=zamowienie.wartosc_brutto,
            zaliczka_klienta=zamowienie.zaliczka_klienta,
            data_zaliczki=zamowienie.data_zaliczki,
            doplacono=zamowienie.doplacono,
            dodaj_do_montazy=zamowienie.dodaj_do_montazy,
            do_doplaty=do_doplaty,
        )
