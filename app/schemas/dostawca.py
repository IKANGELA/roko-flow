from typing import Optional

from pydantic import BaseModel, ConfigDict


class DostawcaCreate(BaseModel):
    """Dane potrzebne do utworzenia nowego dostawcy (bez id — to nadaje baza danych)."""

    nazwa: str
    telefon: Optional[str] = None
    email: Optional[str] = None
    adres: Optional[str] = None
    uwagi: Optional[str] = None


class Dostawca(DostawcaCreate):
    """Pełny rekord dostawcy, taki jaki już istnieje w bazie (ma nadane id)."""

    id: int
    model_config = ConfigDict(from_attributes=True)
