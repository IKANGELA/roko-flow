from datetime import date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class KlientPodsumowanie(BaseModel):
    """Okrojone dane klienta, dołączane do montażu."""

    id: int
    imie_i_nazwisko: str
    telefon: str

    model_config = ConfigDict(from_attributes=True)


class KosztorysPodsumowanie(BaseModel):
    """Okrojone dane kosztorysu (razem z klientem), dołączane do montażu."""

    id: int
    numer: str
    nazwa_inwestycji: Optional[str] = None
    adres_montazu: Optional[str] = None
    klient: KlientPodsumowanie


class MontazCreate(BaseModel):
    kosztorys_id: int

    data_montazu: Optional[date] = None
    godzina_montazu: Optional[time] = None
    co_do_montazu: Optional[str] = None
    nazwa_montazysty: Optional[str] = None
    status_montazu: str = "Do ustalenia"
    uwagi_do_montazu: Optional[str] = None

    oswiadczenie_zlozone: bool = False
    zsynchronizowano_kalendarz: bool = False


class Montaz(MontazCreate):
    id: int
    kosztorys: KosztorysPodsumowanie

    model_config = ConfigDict(from_attributes=True)
