from app.repositories.ustawienia_repository import UstawieniaRepository
from app.schemas.ustawienia import UstawieniaFirmy


class UstawieniaService:
    """Logika biznesowa ustawień firmy — na razie tylko odczyt/zapis, bez żadnej walidacji."""

    def __init__(self, repository: UstawieniaRepository) -> None:
        self._repository = repository

    def pobierz(self) -> UstawieniaFirmy:
        return UstawieniaFirmy.model_validate(self._repository.pobierz())

    def aktualizuj(self, dane: UstawieniaFirmy) -> UstawieniaFirmy:
        return UstawieniaFirmy.model_validate(self._repository.aktualizuj(dane))
