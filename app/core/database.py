from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Baza danych to zwykły plik SQLite w folderze projektu.
SQLALCHEMY_DATABASE_URL = "sqlite:///./roko_flow.db"

# "engine" to obiekt reprezentujący połączenie z bazą danych.
# check_same_thread=False jest potrzebne tylko dla SQLite, żeby serwer mógł
# obsługiwać wiele żądań "na raz".
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# "Sesja" to jedna rozmowa z bazą danych (np. jedno żądanie HTTP = jedna sesja).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Klasa bazowa, po której będą dziedziczyć wszystkie nasze tabele (np. KlientDB)."""


def get_db():
    """
    Generator sesji dla FastAPI (używany przez Depends()).

    Otwiera sesję, oddaje ją do endpointu, a po zakończeniu żądania
    ZAWSZE ją zamyka — nawet jeśli po drodze wystąpi błąd.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
