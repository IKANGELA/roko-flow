from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class KlientDB(Base):
    """Definicja tabeli 'klienci' w bazie danych."""

    __tablename__ = "klienci"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    imie_i_nazwisko: Mapped[str] = mapped_column(String, nullable=False)
    telefon: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    adres: Mapped[str | None] = mapped_column(String, nullable=True)
    nip: Mapped[str | None] = mapped_column(String, nullable=True)
    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)
