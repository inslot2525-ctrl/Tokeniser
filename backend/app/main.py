import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import config
from app.api.routes import router
from app.engine import compressor
from app.engine.llm import LLMError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    compressor.warm_up()
    yield


app = FastAPI(title="Tokeniser API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)


@app.exception_handler(LLMError)
def llm_error_handler(request: Request, exc: LLMError):
    logging.getLogger("app").error("LLM failure on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=502, content={"detail": "Upstream model call failed"})


app.include_router(router)
