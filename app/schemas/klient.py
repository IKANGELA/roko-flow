from typing import Optional

from pydantic import BaseModel, ConfigDict


class KlientCreate(BaseModel):
    """Dane potrzebne do utworzenia nowego klienta (bez id — to nadaje baza danych)."""

    imie_i_nazwisko: str
    telefon: str
    email: Optional[str] = None
    adres: Optional[str] = None
    nip: Optional[str] = None
    uwagi: Optional[str] = None


class Klient(KlientCreate):
    """Pełny rekord klienta, taki jaki już istnieje w bazie (ma nadane id)."""

    id: int

    # Pozwala Pydantic tworzyć tę schemę bezpośrednio z obiektu SQLAlchemy (KlientDB),
    # a nie tylko ze słownika/JSON-a.
    model_config = ConfigDict(from_attributes=True)
