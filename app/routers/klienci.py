from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.klient_repository import KlientRepository
from app.repositories.kosztorys_repository import KosztorysRepository
from app.schemas.klient import Klient, KlientCreate
from app.services.klient_service import KlientService

router = APIRouter(prefix="/klienci", tags=["Klienci"])


def get_klient_service(db: Session = Depends(get_db)) -> KlientService:
    """
    FastAPI najpierw wywoła get_db (Depends w środku), da nam gotową sesję,
    a dopiero potem stworzy z niej repozytorium i serwis dla tego jednego żądania.
    """
    return KlientService(KlientRepository(db), KosztorysRepository(db))


@router.post("/", response_model=Klient)
def utworz_klienta(dane: KlientCreate, service: KlientService = Depends(get_klient_service)) -> Klient:
    return service.utworz_klienta(dane)


@router.get("/", response_model=list[Klient])
def lista_klientow(service: KlientService = Depends(get_klient_service)) -> list[Klient]:
    return service.lista_klientow()


@router.get("/{klient_id}", response_model=Klient)
def pobierz_klienta(klient_id: int, service: KlientService = Depends(get_klient_service)) -> Klient:
    klient = service.pobierz_klienta(klient_id)
    if klient is None:
        raise HTTPException(status_code=404, detail="Klient nie znaleziony")
    return klient


@router.delete("/{klient_id}", status_code=204)
def usun_klienta(klient_id: int, service: KlientService = Depends(get_klient_service)) -> None:
    try:
        usuniety = service.usun_klienta(klient_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not usuniety:
        raise HTTPException(status_code=404, detail="Klient nie znaleziony")
