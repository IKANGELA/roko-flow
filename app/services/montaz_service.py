from typing import List, Optional

from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.schemas.montaz import Montaz, MontazCreate


class MontazService:
    """Logika biznesowa montaży: walidacja powiązania z kosztorysem."""

    def __init__(self, repository: MontazRepository, kosztorys_repository: KosztorysRepository) -> None:
        self._repository = repository
        self._kosztorys_repository = kosztorys_repository

    def _sprawdz_kosztorys(self, dane: MontazCreate) -> None:
        if self._kosztorys_repository.znajdz(dane.kosztorys_id) is None:
            raise ValueError(f"Kosztorys o id={dane.kosztorys_id} nie istnieje")

    def utworz_montaz(self, dane: MontazCreate) -> Montaz:
        self._sprawdz_kosztorys(dane)
        montaz_db = self._repository.dodaj(dane)
        return Montaz.model_validate(montaz_db)

    def aktualizuj_montaz(self, montaz_id: int, dane: MontazCreate) -> Optional[Montaz]:
        self._sprawdz_kosztorys(dane)
        montaz_db = self._repository.aktualizuj(montaz_id, dane)
        if montaz_db is None:
            return None
        return Montaz.model_validate(montaz_db)

    def lista_montazy(self) -> List[Montaz]:
        return [Montaz.model_validate(m) for m in self._repository.wszystkie()]

    def pobierz_montaz(self, montaz_id: int) -> Optional[Montaz]:
        montaz_db = self._repository.znajdz(montaz_id)
        if montaz_db is None:
            return None
        return Montaz.model_validate(montaz_db)
