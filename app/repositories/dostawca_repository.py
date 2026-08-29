from typing import Dict, List, Optional

from app.models.dostawca import Dostawca, DostawcaCreate


class DostawcaRepository:
    """Przechowuje dostawców w pamięci (na razie bez bazy danych — patrz KlientRepository)."""

    def __init__(self) -> None:
        self._dostawcy: Dict[int, Dostawca] = {}
        self._nastepne_id = 1

    def dodaj(self, dane: DostawcaCreate) -> Dostawca:
        dostawca = Dostawca(id=self._nastepne_id, **dane.model_dump())
        self._dostawcy[dostawca.id] = dostawca
        self._nastepne_id += 1
        return dostawca

    def wszyscy(self) -> List[Dostawca]:
        return list(self._dostawcy.values())

    def znajdz(self, dostawca_id: int) -> Optional[Dostawca]:
        return self._dostawcy.get(dostawca_id)
