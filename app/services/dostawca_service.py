from typing import List, Optional

from app.models.dostawca import DostawcaDB
from app.repositories.dostawca_repository import DostawcaRepository
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.dostawca import DostawcaCreate


class DostawcaService:
    """Logika biznesowa dotycząca dostawców."""

    def __init__(self, repository: DostawcaRepository, zamowienie_repository: ZamowienieRepository) -> None:
        self._repository = repository
        self._zamowienie_repository = zamowienie_repository

    def utworz_dostawce(self, dane: DostawcaCreate) -> DostawcaDB:
        return self._repository.dodaj(dane)

    def lista_dostawcow(self) -> List[DostawcaDB]:
        return self._repository.wszyscy()

    def pobierz_dostawce(self, dostawca_id: int) -> Optional[DostawcaDB]:
        return self._repository.znajdz(dostawca_id)

    def aktualizuj_dostawce(self, dostawca_id: int, dane: DostawcaCreate) -> Optional[DostawcaDB]:
        return self._repository.aktualizuj(dostawca_id, dane)

    def usun_dostawce(self, dostawca_id: int) -> bool:
        if self._zamowienie_repository.istnieje_dla_dostawcy(dostawca_id):
            raise ValueError("Nie można usunąć dostawcy — istnieją dla niego zamówienia")
        return self._repository.usun(dostawca_id)
