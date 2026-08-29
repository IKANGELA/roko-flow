from fastapi import FastAPI

from app.routers import klienci

app = FastAPI(title="ROKO Flow")

app.include_router(klienci.router)


@app.get("/")
def read_root():
    return {"message": "ROKO Flow działa!"}
