from typing import List, Optional

from app.models.dostawca import Dostawca, DostawcaCreate
from app.repositories.dostawca_repository import DostawcaRepository


class DostawcaService:
    """Logika biznesowa dotycząca dostawców."""

    def __init__(self, repository: DostawcaRepository) -> None:
        self._repository = repository

    def utworz_dostawce(self, dane: DostawcaCreate) -> Dostawca:
        return self._repository.dodaj(dane)

    def lista_dostawcow(self) -> List[Dostawca]:
        return self._repository.wszyscy()

    def pobierz_dostawce(self, dostawca_id: int) -> Optional[Dostawca]:
        return self._repository.znajdz(dostawca_id)
