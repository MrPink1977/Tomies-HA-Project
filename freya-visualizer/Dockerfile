FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    aiohttp \
    websockets \
    numpy \
    scipy

COPY bridge.py .

CMD ["python", "-u", "bridge.py"]
