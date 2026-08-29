from typing import List, Optional

from app.models.dostawca import DostawcaDB
from app.repositories.dostawca_repository import DostawcaRepository
from app.schemas.dostawca import DostawcaCreate


class DostawcaService:
    """Logika biznesowa dotycząca dostawców."""

    def __init__(self, repository: DostawcaRepository) -> None:
        self._repository = repository

    def utworz_dostawce(self, dane: DostawcaCreate) -> DostawcaDB:
        return self._repository.dodaj(dane)

    def lista_dostawcow(self) -> List[DostawcaDB]:
        return self._repository.wszyscy()

    def pobierz_dostawce(self, dostawca_id: int) -> Optional[DostawcaDB]:
        return self._repository.znajdz(dostawca_id)
