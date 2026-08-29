from typing import List, Optional

from app.models.klient import Klient, KlientCreate
from app.repositories.klient_repository import KlientRepository


class KlientService:
    """Logika biznesowa dotycząca klientów. Nie wie, JAK dane są zapisane — pyta o to repozytorium."""

    def __init__(self, repository: KlientRepository) -> None:
        self._repository = repository

    def utworz_klienta(self, dane: KlientCreate) -> Klient:
        return self._repository.dodaj(dane)

    def lista_klientow(self) -> List[Klient]:
        return self._repository.wszyscy()

    def pobierz_klienta(self, klient_id: int) -> Optional[Klient]:
        return self._repository.znajdz(klient_id)
