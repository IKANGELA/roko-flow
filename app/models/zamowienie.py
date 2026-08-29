from datetime import date

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ZamowienieDB(Base):
    """
    Zamówienie złożone u jednego dostawcy na podstawie kosztorysu.

    Jeden kosztorys może mieć kilka zamówień (po jednym na dostawcę/markę) —
    na razie tworzone i wyceniane ręcznie, patrz architecture_decisions.
    """

    __tablename__ = "zamowienia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kosztorys_id: Mapped[int] = mapped_column(ForeignKey("kosztorysy.id"), nullable=False)
    dostawca_id: Mapped[int] = mapped_column(ForeignKey("dostawcy.id"), nullable=False)

    status: Mapped[str] = mapped_column(String, default="Nowe")
    numer_zamowienia: Mapped[str | None] = mapped_column(String, nullable=True)
    data_zamowienia: Mapped[date | None] = mapped_column(Date, nullable=True)
    termin_realizacji_tygodnie: Mapped[int | None] = mapped_column(Integer, nullable=True)
    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)

    data_dostawy: Mapped[date | None] = mapped_column(Date, nullable=True)
    magazyn: Mapped[str | None] = mapped_column(String, nullable=True)
    braki_w_dostawie: Mapped[str | None] = mapped_column(String, nullable=True)

    zaliczka_producent: Mapped[float] = mapped_column(Float, default=0)
    doplata_producent: Mapped[float] = mapped_column(Float, default=0)

    wartosc_netto: Mapped[float] = mapped_column(Float, nullable=False)
    wartosc_brutto: Mapped[float] = mapped_column(Float, nullable=False)

    zaliczka_klienta: Mapped[float] = mapped_column(Float, default=0)
    data_zaliczki: Mapped[date | None] = mapped_column(Date, nullable=True)
    doplacono: Mapped[bool] = mapped_column(Boolean, default=False)

    dodaj_do_montazy: Mapped[bool] = mapped_column(Boolean, default=False)
