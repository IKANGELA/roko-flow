from fastapi import FastAPI

app = FastAPI(title="ROKO Flow")


@app.get("/")
def read_root():
    return {"message": "ROKO Flow działa!"}
