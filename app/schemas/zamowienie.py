from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class KlientPodsumowanie(BaseModel):
    """Okrojone dane klienta, dołączane do zamówienia (przez kosztorys)."""

    id: int
    imie_i_nazwisko: str
    telefon: str

    model_config = ConfigDict(from_attributes=True)


class KosztorysPodsumowanie(BaseModel):
    """Okrojone dane kosztorysu (razem z klientem), dołączane do zamówienia."""

    id: int
    numer: str
    nazwa_inwestycji: Optional[str] = None
    klient: KlientPodsumowanie


class DostawcaPodsumowanie(BaseModel):
    """Okrojone dane dostawcy, dołączane do zamówienia."""

    id: int
    nazwa: str

    model_config = ConfigDict(from_attributes=True)


class ZamowienieCreate(BaseModel):
    kosztorys_id: Optional[int] = None
    dostawca_id: Optional[int] = None

    status: str = "Nowe"
    adres_nabywcy: Optional[str] = None
    adres_montazu: Optional[str] = None
    numer_zamowienia: Optional[str] = None
    data_zamowienia: Optional[date] = None
    termin_realizacji_tygodnie: Optional[int] = None
    uwagi: Optional[str] = None

    data_dostawy: Optional[date] = None
    magazyn: Optional[str] = None
    braki_w_dostawie: Optional[str] = None

    zaliczka_producent: float = 0
    doplata_producent: float = 0

    wartosc_netto: Optional[float] = None
    vat_procent: float = 8

    zaliczka_klienta: float = 0
    data_zaliczki: Optional[date] = None
    doplacono: bool = False

    dodaj_do_montazy: bool = False


class Zamowienie(ZamowienieCreate):
    id: int
    kosztorys: Optional[KosztorysPodsumowanie] = None
    dostawca: Optional[DostawcaPodsumowanie] = None

    # Wyliczane przez serwis, nie ma takich kolumn w bazie — None, dopóki nie znamy wartości netto.
    wartosc_brutto: Optional[float] = None
    do_doplaty: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
