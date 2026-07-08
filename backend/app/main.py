from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "https://tokeniser-eta.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "status": "TokenWise Backend Running"
    }