from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.dostawca_repository import DostawcaRepository
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.kosztorys import Kosztorys, KosztorysCreate
from app.services.kosztorys_service import KosztorysService

router = APIRouter(prefix="/kosztorysy", tags=["Kosztorysy"])


def get_kosztorys_service(db: Session = Depends(get_db)) -> KosztorysService:
    return KosztorysService(
        KosztorysRepository(db),
        KlientRepository(db),
        ZamowienieRepository(db),
        MontazRepository(db),
        DostawcaRepository(db),
    )


@router.post("/", response_model=Kosztorys)
def utworz_kosztorys(
    dane: KosztorysCreate, service: KosztorysService = Depends(get_kosztorys_service)
) -> Kosztorys:
    try:
        return service.utworz_kosztorys(dane)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{kosztorys_id}", response_model=Kosztorys)
def aktualizuj_kosztorys(
    kosztorys_id: int,
    dane: KosztorysCreate,
    service: KosztorysService = Depends(get_kosztorys_service),
) -> Kosztorys:
    try:
        kosztorys = service.aktualizuj_kosztorys(kosztorys_id, dane)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if kosztorys is None:
        raise HTTPException(status_code=404, detail="Kosztorys nie znaleziony")
    return kosztorys


@router.get("/", response_model=list[Kosztorys])
def lista_kosztorysow(service: KosztorysService = Depends(get_kosztorys_service)) -> list[Kosztorys]:
    return service.lista_kosztorysow()


@router.get("/{kosztorys_id}", response_model=Kosztorys)
def pobierz_kosztorys(
    kosztorys_id: int, service: KosztorysService = Depends(get_kosztorys_service)
) -> Kosztorys:
    kosztorys = service.pobierz_kosztorys(kosztorys_id)
    if kosztorys is None:
        raise HTTPException(status_code=404, detail="Kosztorys nie znaleziony")
    return kosztorys


@router.delete("/{kosztorys_id}", status_code=204)
def usun_kosztorys(
    kosztorys_id: int, service: KosztorysService = Depends(get_kosztorys_service)
) -> None:
    try:
        usuniety = service.usun_kosztorys(kosztorys_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not usuniety:
        raise HTTPException(status_code=404, detail="Kosztorys nie znaleziony")
