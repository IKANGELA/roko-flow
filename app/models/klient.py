from typing import Optional

from pydantic import BaseModel


class KlientCreate(BaseModel):
    """Dane potrzebne do utworzenia nowego klienta (bez id — to nadaje repozytorium)."""

    imie_i_nazwisko: str
    telefon: str
    email: Optional[str] = None
    adres: Optional[str] = None
    nip: Optional[str] = None
    uwagi: Optional[str] = None


class Klient(KlientCreate):
    """Pełny rekord klienta, taki jaki już istnieje w systemie (ma nadane id)."""

    id: int
