from datetime import date

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ZamowienieDB(Base):
    """
    Zamówienie złożone u jednego dostawcy na podstawie kosztorysu.

    Jeden kosztorys może mieć kilka zamówień (po jednym na dostawcę/markę) —
    na razie tworzone i wyceniane ręcznie, patrz architecture_decisions.

    kosztorys_id jest opcjonalny — zamówienie nie zawsze wynika z kosztorysu
    (np. zlecenie serwisowe albo doraźny zakup), rodzaj takiego "wolnego"
    zamówienia opisuje się po prostu w polu status/uwagi.
    """

    __tablename__ = "zamowienia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kosztorys_id: Mapped[int | None] = mapped_column(ForeignKey("kosztorysy.id"), nullable=True)
    # Dostawca bywa nieznany w chwili akceptacji kosztorysu — uzupełniany później, stąd nullable.
    dostawca_id: Mapped[int | None] = mapped_column(ForeignKey("dostawcy.id"), nullable=True)

    status: Mapped[str] = mapped_column(String, default="Nowe")
    # Osobny status "czy to zamówienie zostało faktycznie złożone u dostawcy" — to inna
    # ścieżka niż ogólny status zamówienia, bo jeden kosztorys może mieć kilka zamówień
    # u różnych dostawców, każde na innym etapie składania. Zaznaczane ręcznie na liście.
    status_zamowienia_dostawcy: Mapped[str] = mapped_column(String, default="Do zamówienia")
    # Niezależne od kosztorysu — przydatne zwłaszcza przy "wolnych" zamówieniach bez kosztorysu.
    adres_nabywcy: Mapped[str | None] = mapped_column(String, nullable=True)
    adres_montazu: Mapped[str | None] = mapped_column(String, nullable=True)
    numer_zamowienia: Mapped[str | None] = mapped_column(String, nullable=True)
    data_zamowienia: Mapped[date | None] = mapped_column(Date, nullable=True)
    termin_realizacji_tygodnie: Mapped[int | None] = mapped_column(Integer, nullable=True)
    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)

    data_dostawy: Mapped[date | None] = mapped_column(Date, nullable=True)
    magazyn: Mapped[str | None] = mapped_column(String, nullable=True)
    braki_w_dostawie: Mapped[str | None] = mapped_column(String, nullable=True)

    zaliczka_producent: Mapped[float] = mapped_column(Float, default=0)
    doplata_producent: Mapped[float] = mapped_column(Float, default=0)

    # Wartość netto bywa nieznana do czasu wyceny u dostawcy — również nullable.
    wartosc_netto: Mapped[float | None] = mapped_column(Float, nullable=True)
    vat_procent: Mapped[float] = mapped_column(Float, default=8)

    zaliczka_klienta: Mapped[float] = mapped_column(Float, default=0)
    data_zaliczki: Mapped[date | None] = mapped_column(Date, nullable=True)
    doplacono: Mapped[bool] = mapped_column(Boolean, default=False)

    dodaj_do_montazy: Mapped[bool] = mapped_column(Boolean, default=False)
