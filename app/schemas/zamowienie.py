from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


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
    wartosc_brutto: float

    zaliczka_klienta: float = 0
    data_zaliczki: Optional[date] = None
    doplacono: bool = False

    dodaj_do_montazy: bool = False


class Zamowienie(ZamowienieCreate):
    id: int

    # Wyliczane przez serwis: wartosc_brutto - zaliczka_klienta.
    do_doplaty: float

    model_config = ConfigDict(from_attributes=True)
