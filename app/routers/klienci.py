from fastapi import APIRouter, Depends, HTTPException

from app.models.klient import Klient, KlientCreate
from app.repositories.klient_repository import KlientRepository
from app.services.klient_service import KlientService

router = APIRouter(prefix="/klienci", tags=["Klienci"])

# Na razie jedno, wspólne repozytorium dla całej aplikacji (odpowiednik "jednej bazy danych w pamięci").
_repository = KlientRepository()


def get_klient_service() -> KlientService:
    """Fabryka serwisu — FastAPI wywoła tę funkcję za nas i 'wstrzyknie' gotowy serwis do endpointu."""
    return KlientService(_repository)


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
