from datetime import date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MontazCreate(BaseModel):
    kosztorys_id: int

    data_montazu: Optional[date] = None
    godzina_montazu: Optional[time] = None
    co_do_montazu: Optional[str] = None
    nazwa_montazysty: Optional[str] = None
    status_montazu: str = "Do ustalenia"
    uwagi_do_montazu: Optional[str] = None

    oswiadczenie_zlozone: bool = False
    zsynchronizowano_kalendarz: bool = False


class Montaz(MontazCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
