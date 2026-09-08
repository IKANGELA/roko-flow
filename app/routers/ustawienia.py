from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.ustawienia_repository import UstawieniaRepository
from app.schemas.ustawienia import UstawieniaFirmy
from app.services.ustawienia_service import UstawieniaService

router = APIRouter(prefix="/ustawienia", tags=["Ustawienia"])


def get_ustawienia_service(db: Session = Depends(get_db)) -> UstawieniaService:
    return UstawieniaService(UstawieniaRepository(db))


@router.get("/firma", response_model=UstawieniaFirmy)
def pobierz_ustawienia(service: UstawieniaService = Depends(get_ustawienia_service)) -> UstawieniaFirmy:
    return service.pobierz()


@router.put("/firma", response_model=UstawieniaFirmy)
def aktualizuj_ustawienia(
    dane: UstawieniaFirmy, service: UstawieniaService = Depends(get_ustawienia_service)
) -> UstawieniaFirmy:
    return service.aktualizuj(dane)
