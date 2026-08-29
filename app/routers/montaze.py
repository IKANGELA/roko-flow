from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.schemas.montaz import Montaz, MontazCreate
from app.services.montaz_service import MontazService

router = APIRouter(prefix="/montaze", tags=["Montaże"])


def get_montaz_service(db: Session = Depends(get_db)) -> MontazService:
    return MontazService(MontazRepository(db), KosztorysRepository(db), KlientRepository(db))


@router.post("/", response_model=Montaz)
def utworz_montaz(dane: MontazCreate, service: MontazService = Depends(get_montaz_service)) -> Montaz:
    try:
        return service.utworz_montaz(dane)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{montaz_id}", response_model=Montaz)
def aktualizuj_montaz(
    montaz_id: int, dane: MontazCreate, service: MontazService = Depends(get_montaz_service)
) -> Montaz:
    try:
        montaz = service.aktualizuj_montaz(montaz_id, dane)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if montaz is None:
        raise HTTPException(status_code=404, detail="Montaż nie znaleziony")
    return montaz


@router.get("/", response_model=list[Montaz])
def lista_montazy(service: MontazService = Depends(get_montaz_service)) -> list[Montaz]:
    return service.lista_montazy()


@router.get("/{montaz_id}", response_model=Montaz)
def pobierz_montaz(montaz_id: int, service: MontazService = Depends(get_montaz_service)) -> Montaz:
    montaz = service.pobierz_montaz(montaz_id)
    if montaz is None:
        raise HTTPException(status_code=404, detail="Montaż nie znaleziony")
    return montaz


@router.delete("/{montaz_id}", status_code=204)
def usun_montaz(montaz_id: int, service: MontazService = Depends(get_montaz_service)) -> None:
    usuniety = service.usun_montaz(montaz_id)
    if not usuniety:
        raise HTTPException(status_code=404, detail="Montaż nie znaleziony")
