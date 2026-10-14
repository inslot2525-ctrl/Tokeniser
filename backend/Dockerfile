FROM python:3.12-slim

# Build with --build-arg WITH_LINGUA=true to bundle LLMLingua-2 local
# compression (CPU PyTorch + the ~700 MB model; needs ~1.5 GB RAM at runtime).
ARG WITH_LINGUA=false

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.hf

WORKDIR /app

COPY requirements.txt requirements-lingua.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && if [ "$WITH_LINGUA" = "true" ]; then \
        pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
            -r requirements-lingua.txt \
        && python -c "from llmlingua import PromptCompressor; PromptCompressor(model_name='microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank', use_llmlingua2=True, device_map='cpu')"; \
    fi

COPY app ./app

RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
