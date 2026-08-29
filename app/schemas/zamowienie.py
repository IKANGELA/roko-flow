from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class KosztorysPodsumowanie(BaseModel):
    """Okrojone dane kosztorysu, dołączane do zamówienia, żeby nie trzeba było ich dociągać osobno."""

    id: int
    numer: str
    nazwa_inwestycji: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DostawcaPodsumowanie(BaseModel):
    """Okrojone dane dostawcy, dołączane do zamówienia."""

    id: int
    nazwa: str

    model_config = ConfigDict(from_attributes=True)


class ZamowienieCreate(BaseModel):
    kosztorys_id: int
    dostawca_id: int

    status: str = "Nowe"
    numer_zamowienia: Optional[str] = None
    data_zamowienia: Optional[date] = None
    termin_realizacji_tygodnie: Optional[int] = None
    uwagi: Optional[str] = None

    data_dostawy: Optional[date] = None
    magazyn: Optional[str] = None
    braki_w_dostawie: Optional[str] = None

    zaliczka_producent: float = 0
    doplata_producent: float = 0

    wartosc_netto: float
    vat_procent: float = 8

    zaliczka_klienta: float = 0
    data_zaliczki: Optional[date] = None
    doplacono: bool = False

    dodaj_do_montazy: bool = False


class Zamowienie(ZamowienieCreate):
    id: int
    kosztorys: KosztorysPodsumowanie
    dostawca: DostawcaPodsumowanie

    # Wyliczane przez serwis, nie ma takich kolumn w bazie:
    wartosc_brutto: float
    do_doplaty: float

    model_config = ConfigDict(from_attributes=True)
