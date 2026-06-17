FROM python:3.11-slim

# WeasyPrint needs these system libs for PDF rendering
RUN apt-get update && apt-get install -y \
    fonts-dejavu \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz-subset0 \
    libjpeg62-turbo \
    libopenjp2-7 \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

RUN mkdir -p /app/reports

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8099"]
