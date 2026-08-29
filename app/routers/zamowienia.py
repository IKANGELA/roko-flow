from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.dostawca_repository import DostawcaRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.zamowienie import Zamowienie, ZamowienieCreate
from app.services.zamowienie_service import ZamowienieService

router = APIRouter(prefix="/zamowienia", tags=["Zamówienia"])


def get_zamowienie_service(db: Session = Depends(get_db)) -> ZamowienieService:
    return ZamowienieService(
        ZamowienieRepository(db), KosztorysRepository(db), DostawcaRepository(db)
    )


@router.post("/", response_model=Zamowienie)
def utworz_zamowienie(
    dane: ZamowienieCreate, service: ZamowienieService = Depends(get_zamowienie_service)
) -> Zamowienie:
    try:
        return service.utworz_zamowienie(dane)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{zamowienie_id}", response_model=Zamowienie)
def aktualizuj_zamowienie(
    zamowienie_id: int,
    dane: ZamowienieCreate,
    service: ZamowienieService = Depends(get_zamowienie_service),
) -> Zamowienie:
    try:
        zamowienie = service.aktualizuj_zamowienie(zamowienie_id, dane)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if zamowienie is None:
        raise HTTPException(status_code=404, detail="Zamówienie nie znalezione")
    return zamowienie


@router.get("/", response_model=list[Zamowienie])
def lista_zamowien(service: ZamowienieService = Depends(get_zamowienie_service)) -> list[Zamowienie]:
    return service.lista_zamowien()


@router.get("/{zamowienie_id}", response_model=Zamowienie)
def pobierz_zamowienie(
    zamowienie_id: int, service: ZamowienieService = Depends(get_zamowienie_service)
) -> Zamowienie:
    zamowienie = service.pobierz_zamowienie(zamowienie_id)
    if zamowienie is None:
        raise HTTPException(status_code=404, detail="Zamówienie nie znalezione")
    return zamowienie
