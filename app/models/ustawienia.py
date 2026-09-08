from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UstawieniaFirmyDB(Base):
    """
    Dane firmy (Wykonawcy) używane na drukach (kosztorys, umowa, itd.) — jeden wiersz
    (singleton, id zawsze = 1), edytowany przez użytkownika na ekranie Ustawień, nie
    zaszyty w kodzie. Patrz app/repositories/ustawienia_repository.py::ID_SINGLETONA.
    """

    __tablename__ = "ustawienia_firmy"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nazwa: Mapped[str | None] = mapped_column(String, nullable=True)
    adres: Mapped[str | None] = mapped_column(String, nullable=True)
    nip: Mapped[str | None] = mapped_column(String, nullable=True)
    konto_bankowe: Mapped[str | None] = mapped_column(String, nullable=True)
    telefon: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    www: Mapped[str | None] = mapped_column(String, nullable=True)
