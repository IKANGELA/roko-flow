from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.dostawca_repository import DostawcaRepository
from app.schemas.dostawca import Dostawca, DostawcaCreate
from app.services.dostawca_service import DostawcaService

router = APIRouter(prefix="/dostawcy", tags=["Dostawcy"])


def get_dostawca_service(db: Session = Depends(get_db)) -> DostawcaService:
    repository = DostawcaRepository(db)
    return DostawcaService(repository)


@router.post("/", response_model=Dostawca)
def utworz_dostawce(dane: DostawcaCreate, service: DostawcaService = Depends(get_dostawca_service)) -> Dostawca:
    return service.utworz_dostawce(dane)


@router.get("/", response_model=list[Dostawca])
def lista_dostawcow(service: DostawcaService = Depends(get_dostawca_service)) -> list[Dostawca]:
    return service.lista_dostawcow()


@router.get("/{dostawca_id}", response_model=Dostawca)
def pobierz_dostawce(dostawca_id: int, service: DostawcaService = Depends(get_dostawca_service)) -> Dostawca:
    dostawca = service.pobierz_dostawce(dostawca_id)
    if dostawca is None:
        raise HTTPException(status_code=404, detail="Dostawca nie znaleziony")
    return dostawca
