from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DostawcaDB(Base):
    """Definicja tabeli 'dostawcy' w bazie danych."""

    __tablename__ = "dostawcy"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nazwa: Mapped[str] = mapped_column(String, nullable=False)
    specyfikacja: Mapped[str | None] = mapped_column(String, nullable=True)
    telefon: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    adres: Mapped[str | None] = mapped_column(String, nullable=True)
    uwagi: Mapped[str | None] = mapped_column(String, nullable=True)
