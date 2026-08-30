from typing import List, Optional

from app.models.klient import KlientDB
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.schemas.klient import KlientCreate


class KlientService:
    """Logika biznesowa dotycząca klientów. Nie wie, JAK dane są zapisane — pyta o to repozytorium."""

    def __init__(self, repository: KlientRepository, kosztorys_repository: KosztorysRepository) -> None:
        self._repository = repository
        self._kosztorys_repository = kosztorys_repository

    def utworz_klienta(self, dane: KlientCreate) -> KlientDB:
        return self._repository.dodaj(dane)

    def lista_klientow(self) -> List[KlientDB]:
        return self._repository.wszyscy()

    def pobierz_klienta(self, klient_id: int) -> Optional[KlientDB]:
        return self._repository.znajdz(klient_id)

    def aktualizuj_klienta(self, klient_id: int, dane: KlientCreate) -> Optional[KlientDB]:
        return self._repository.aktualizuj(klient_id, dane)

    def usun_klienta(self, klient_id: int) -> bool:
        if self._kosztorys_repository.istnieje_dla_klienta(klient_id):
            raise ValueError("Nie można usunąć klienta — istnieją dla niego kosztorysy")
        return self._repository.usun(klient_id)
