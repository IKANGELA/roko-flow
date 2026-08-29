from typing import List, Optional

from app.models.montaz import MontazDB
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.schemas.montaz import KlientPodsumowanie, KosztorysPodsumowanie, Montaz, MontazCreate


class MontazService:
    """Logika biznesowa montaży: walidacja powiązania z kosztorysem."""

    def __init__(
        self,
        repository: MontazRepository,
        kosztorys_repository: KosztorysRepository,
        klient_repository: KlientRepository,
    ) -> None:
        self._repository = repository
        self._kosztorys_repository = kosztorys_repository
        self._klient_repository = klient_repository

    def _sprawdz_kosztorys(self, dane: MontazCreate) -> None:
        if self._kosztorys_repository.znajdz(dane.kosztorys_id) is None:
            raise ValueError(f"Kosztorys o id={dane.kosztorys_id} nie istnieje")

    def utworz_montaz(self, dane: MontazCreate) -> Montaz:
        self._sprawdz_kosztorys(dane)
        montaz_db = self._repository.dodaj(dane)
        return self._do_schematu(montaz_db)

    def aktualizuj_montaz(self, montaz_id: int, dane: MontazCreate) -> Optional[Montaz]:
        self._sprawdz_kosztorys(dane)
        montaz_db = self._repository.aktualizuj(montaz_id, dane)
        if montaz_db is None:
            return None
        return self._do_schematu(montaz_db)

    def lista_montazy(self) -> List[Montaz]:
        return [self._do_schematu(m) for m in self._repository.wszystkie()]

    def pobierz_montaz(self, montaz_id: int) -> Optional[Montaz]:
        montaz_db = self._repository.znajdz(montaz_id)
        if montaz_db is None:
            return None
        return self._do_schematu(montaz_db)

    def usun_montaz(self, montaz_id: int) -> bool:
        return self._repository.usun(montaz_id)

    def _do_schematu(self, montaz: MontazDB) -> Montaz:
        kosztorys = self._kosztorys_repository.znajdz(montaz.kosztorys_id)
        klient = self._klient_repository.znajdz(kosztorys.klient_id)
        kosztorys_podsumowanie = KosztorysPodsumowanie(
            id=kosztorys.id,
            numer=kosztorys.numer,
            nazwa_inwestycji=kosztorys.nazwa_inwestycji,
            adres_montazu=kosztorys.adres_montazu,
            klient=KlientPodsumowanie.model_validate(klient),
        )
        return Montaz(
            id=montaz.id,
            kosztorys_id=montaz.kosztorys_id,
            kosztorys=kosztorys_podsumowanie,
            data_montazu=montaz.data_montazu,
            godzina_montazu=montaz.godzina_montazu,
            co_do_montazu=montaz.co_do_montazu,
            nazwa_montazysty=montaz.nazwa_montazysty,
            status_montazu=montaz.status_montazu,
            uwagi_do_montazu=montaz.uwagi_do_montazu,
            oswiadczenie_zlozone=montaz.oswiadczenie_zlozone,
            zsynchronizowano_kalendarz=montaz.zsynchronizowano_kalendarz,
        )
