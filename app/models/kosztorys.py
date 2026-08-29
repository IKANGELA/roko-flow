from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
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
    adres_montazu: Mapped[str | None] = mapped_column(String, nullable=True)
    termin: Mapped[str | None] = mapped_column(String, nullable=True)
    data: Mapped[date] = mapped_column(Date, default=date.today)

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
    """Jedna pozycja w kosztorysie, np. 'Drzwi do salonu' albo 'Okno w kuchni'."""

    __tablename__ = "pozycje_kosztorysu"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kosztorys_id: Mapped[int] = mapped_column(ForeignKey("kosztorysy.id"), nullable=False)

    nazwa: Mapped[str] = mapped_column(String, nullable=False)
    opis: Mapped[str | None] = mapped_column(String, nullable=True)
    kolor: Mapped[str | None] = mapped_column(String, nullable=True)
    oscieznica_rodzaj: Mapped[str | None] = mapped_column(String, nullable=True)
    informacje_dodatkowe: Mapped[str | None] = mapped_column(String, nullable=True)
    szklo: Mapped[str | None] = mapped_column(String, nullable=True)
    wentylacja: Mapped[str | None] = mapped_column(String, nullable=True)
    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)

    kosztorys: Mapped["KosztorysDB"] = relationship(back_populates="pozycje")
    skladniki: Mapped[list["SkladnikPozycjiDB"]] = relationship(
        back_populates="pozycja",
        cascade="all, delete-orphan",
        order_by="SkladnikPozycjiDB.id",
    )


class SkladnikPozycjiDB(Base):
    """Jeden składnik kosztu pozycji, np. 'Montaż drzwi' — 200 zł, 'Podfrezowanie' — 50 zł."""

    __tablename__ = "skladniki_pozycji"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pozycja_id: Mapped[int] = mapped_column(ForeignKey("pozycje_kosztorysu.id"), nullable=False)

    opis: Mapped[str] = mapped_column(String, nullable=False)
    kwota: Mapped[float] = mapped_column(Float, nullable=False)

    pozycja: Mapped["PozycjaKosztorysuDB"] = relationship(back_populates="skladniki")
