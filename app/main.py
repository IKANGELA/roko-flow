from fastapi import FastAPI

from app.routers import dostawcy, klienci

app = FastAPI(title="ROKO Flow")

app.include_router(klienci.router)
app.include_router(dostawcy.router)


@app.get("/")
def read_root():
    return {"message": "ROKO Flow działa!"}
