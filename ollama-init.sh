#!/bin/bash

echo "Starting Ollama server..."
/bin/ollama serve &

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Ollama is ready!"
        break
    fi
    echo "Still waiting... ($i/30)"
    sleep 2
done

# Pre-load the model to GPU
echo "Pre-loading qwen3:8b to GPU..."
ollama run qwen3:8b "System ready" > /dev/null 2>&1

echo "Model loaded and ready! OLLAMA_KEEP_ALIVE=-1 will keep it in GPU memory."

# Keep container running
wait