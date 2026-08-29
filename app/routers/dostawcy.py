from fastapi import APIRouter, Depends, HTTPException

from app.models.dostawca import Dostawca, DostawcaCreate
from app.repositories.dostawca_repository import DostawcaRepository
from app.services.dostawca_service import DostawcaService

router = APIRouter(prefix="/dostawcy", tags=["Dostawcy"])

_repository = DostawcaRepository()


def get_dostawca_service() -> DostawcaService:
    return DostawcaService(_repository)


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
