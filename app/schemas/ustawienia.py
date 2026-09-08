from typing import Optional

from pydantic import BaseModel, ConfigDict


class UstawieniaFirmy(BaseModel):
    """Dane Wykonawcy drukowane na dokumentach — patrz app/models/ustawienia.py."""

    nazwa: Optional[str] = None
    adres: Optional[str] = None
    nip: Optional[str] = None
    konto_bankowe: Optional[str] = None
    telefon: Optional[str] = None
    email: Optional[str] = None
    www: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
