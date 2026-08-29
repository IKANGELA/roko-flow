from typing import Dict, List, Optional

from app.models.klient import Klient, KlientCreate


class KlientRepository:
    """
    Odpowiada wyłącznie za przechowywanie i odczyt danych klientów.

    Na razie dane trzymamy w pamięci (znikają po restarcie serwera).
    Gdy dołożymy prawdziwą bazę danych, zmieni się TYLKO ta klasa —
    serwis i router nie będą wiedzieć o tej zmianie.
    """

    def __init__(self) -> None:
        self._klienci: Dict[int, Klient] = {}
        self._nastepne_id = 1

    def dodaj(self, dane: KlientCreate) -> Klient:
        klient = Klient(id=self._nastepne_id, **dane.model_dump())
        self._klienci[klient.id] = klient
        self._nastepne_id += 1
        return klient

    def wszyscy(self) -> List[Klient]:
        return list(self._klienci.values())

    def znajdz(self, klient_id: int) -> Optional[Klient]:
        return self._klienci.get(klient_id)
