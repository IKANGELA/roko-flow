from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class SkladnikCreate(BaseModel):
    """Jeden składnik kosztu pozycji, np. 'Montaż drzwi' + kwota."""

    opis: str
    kwota: float


class Skladnik(SkladnikCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class PozycjaCreate(BaseModel):
    """Jedna pozycja kosztorysu wraz z listą jej składników kosztu."""

    nazwa: str
    opis: Optional[str] = None
    kolor: Optional[str] = None
    oscieznica_rodzaj: Optional[str] = None
    informacje_dodatkowe: Optional[str] = None
    szklo: Optional[str] = None
    wentylacja: Optional[str] = None
    uwagi: Optional[str] = None
    skladniki: List[SkladnikCreate] = []


class Pozycja(BaseModel):
    id: int
    nazwa: str
    opis: Optional[str] = None
    kolor: Optional[str] = None
    oscieznica_rodzaj: Optional[str] = None
    informacje_dodatkowe: Optional[str] = None
    szklo: Optional[str] = None
    wentylacja: Optional[str] = None
    uwagi: Optional[str] = None
    skladniki: List[Skladnik] = []

    # Wyliczane przez serwis jako suma kwot składników — nie ma takiej kolumny w bazie.
    suma_netto: float

    model_config = ConfigDict(from_attributes=True)


class KosztorysCreate(BaseModel):
    """Dane potrzebne do utworzenia nowego kosztorysu, razem z pozycjami i ich składnikami."""

    klient_id: int
    wersja: int = 1
    nazwa_inwestycji: Optional[str] = None
    adres_montazu: Optional[str] = None
    termin: Optional[str] = None
    vat_procent: float = 8
    dodatkowe_koszty: float = 0
    rabat: float = 0
    ustalona_zaliczka: Optional[float] = None
    pozycje: List[PozycjaCreate] = []


class Kosztorys(BaseModel):
    id: int
    klient_id: int
    numer: str
    wersja: int
    nazwa_inwestycji: Optional[str] = None
    adres_montazu: Optional[str] = None
    termin: Optional[str] = None
    data: date
    vat_procent: float
    dodatkowe_koszty: float
    rabat: float
    ustalona_zaliczka: Optional[float] = None
    pozycje: List[Pozycja] = []

    # Pola wyliczane przez serwis (nie istnieją jako kolumny w bazie):
    suma_netto_pozycji: float
    suma_netto: float
    suma_brutto: float
    zaliczka: float
    do_doplaty: float

    model_config = ConfigDict(from_attributes=True)
