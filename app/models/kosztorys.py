from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class KosztorysDB(Base):
    """Nagłówek kosztorysu — dane klienta/inwestycji i podsumowanie finansowe."""

    __tablename__ = "kosztorysy"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    klient_id: Mapped[int] = mapped_column(ForeignKey("klienci.id"), nullable=False)

    numer: Mapped[str] = mapped_column(String, nullable=False)
    wersja: Mapped[int] = mapped_column(Integer, default=1)
    nazwa_inwestycji: Mapped[str | None] = mapped_column(String, nullable=True)
    # Adres i NIP nabywcy do faktury — bywają inne niż dane samego klienta (np. faktura na
    # firmę), dlatego to osobne pola, tylko podpowiadane z karty klienta przy jego wyborze.
    adres_nabywcy: Mapped[str | None] = mapped_column(String, nullable=True)
    nip_nabywcy: Mapped[str | None] = mapped_column(String, nullable=True)
    adres_montazu: Mapped[str | None] = mapped_column(String, nullable=True)
    termin: Mapped[str | None] = mapped_column(String, nullable=True)
    data: Mapped[date] = mapped_column(Date, default=date.today)
    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)
    wybrany_do_realizacji: Mapped[bool] = mapped_column(Boolean, default=False)
    ostatnia_aktualizacja: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vat_procent: Mapped[float] = mapped_column(Float, default=8)
    dodatkowe_koszty: Mapped[float] = mapped_column(Float, default=0)
    rabat: Mapped[float] = mapped_column(Float, default=0)
    ustalona_zaliczka: Mapped[float | None] = mapped_column(Float, nullable=True)

    pozycje: Mapped[list["PozycjaKosztorysuDB"]] = relationship(
        back_populates="kosztorys",
        cascade="all, delete-orphan",
        order_by="PozycjaKosztorysuDB.id",
    )


class PozycjaKosztorysuDB(Base):
    """
    Jedna pozycja w kosztorysie, np. 'Drzwi do salonu' albo 'Okno w kuchni'.

    Każda z opisowych kolumn (opis, kolor, ościeżnica, informacje dodatkowe, szkło,
    wentylacja, uwagi) ma obok siebie własne pole `_kwota` — jeśli dany element trzeba
    wycenić (np. konkretny model drzwi w polu opis, albo dopłata za nietypową ościeżnicę),
    cena wpisywana jest bezpośrednio pod jego treścią, a nie w osobnej, oderwanej liście.
    Montaż nie ma własnej treści opisowej — to wyłącznie pole na cenę robocizny.
    """

    __tablename__ = "pozycje_kosztorysu"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kosztorys_id: Mapped[int] = mapped_column(ForeignKey("kosztorysy.id"), nullable=False)
    # Producent/marka, od którego pochodzi ta konkretna pozycja (np. drzwi od Erkado,
    # klamki od VDS) — różne pozycje w jednym kosztorysie mogą mieć różnych dostawców.
    dostawca_id: Mapped[int | None] = mapped_column(ForeignKey("dostawcy.id"), nullable=True)

    nazwa: Mapped[str] = mapped_column(String, nullable=False)

    montaz_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    opis: Mapped[str | None] = mapped_column(String, nullable=True)
    opis_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    kolor: Mapped[str | None] = mapped_column(String, nullable=True)
    kolor_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    oscieznica_rodzaj: Mapped[str | None] = mapped_column(String, nullable=True)
    oscieznica_rodzaj_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    informacje_dodatkowe: Mapped[str | None] = mapped_column(String, nullable=True)
    informacje_dodatkowe_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    szklo: Mapped[str | None] = mapped_column(String, nullable=True)
    szklo_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    wentylacja: Mapped[str | None] = mapped_column(String, nullable=True)
    wentylacja_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)
    uwagi_kwota: Mapped[float | None] = mapped_column(Float, nullable=True)

    kosztorys: Mapped["KosztorysDB"] = relationship(back_populates="pozycje")
