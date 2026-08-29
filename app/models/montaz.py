from datetime import date, time

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MontazDB(Base):
    """Termin montażu dla całej inwestycji z danego kosztorysu."""

    __tablename__ = "montaze"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kosztorys_id: Mapped[int] = mapped_column(ForeignKey("kosztorysy.id"), nullable=False)

    data_montazu: Mapped[date | None] = mapped_column(Date, nullable=True)
    godzina_montazu: Mapped[time | None] = mapped_column(Time, nullable=True)
    co_do_montazu: Mapped[str | None] = mapped_column(String, nullable=True)
    nazwa_montazysty: Mapped[str | None] = mapped_column(String, nullable=True)
    status_montazu: Mapped[str] = mapped_column(String, default="Do ustalenia")
    uwagi_do_montazu: Mapped[str | None] = mapped_column(String, nullable=True)

    oswiadczenie_zlozone: Mapped[bool] = mapped_column(Boolean, default=False)
    zsynchronizowano_kalendarz: Mapped[bool] = mapped_column(Boolean, default=False)
