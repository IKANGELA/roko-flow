from typing import List, Optional

from app.models.klient import KlientDB
from app.repositories.klient_repository import KlientRepository
from app.schemas.klient import KlientCreate


class KlientService:
    """Logika biznesowa dotycząca klientów. Nie wie, JAK dane są zapisane — pyta o to repozytorium."""

    def __init__(self, repository: KlientRepository) -> None:
        self._repository = repository

    def utworz_klienta(self, dane: KlientCreate) -> KlientDB:
        return self._repository.dodaj(dane)

    def lista_klientow(self) -> List[KlientDB]:
        return self._repository.wszyscy()

    def pobierz_klienta(self, klient_id: int) -> Optional[KlientDB]:
        return self._repository.znajdz(klient_id)
