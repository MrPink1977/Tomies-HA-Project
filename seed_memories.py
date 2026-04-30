Set-Content -Path "C:\AI_Projects\homeassistant\seed_memories.py" -Encoding utf8 -Value @"
import chromadb
import time
import requests

def get_embedding(text):
    response = requests.post(
        "http://localhost:11434/api/embeddings",
        json={"model": "nomic-embed-text:latest", "prompt": text}
    )
    return response.json()["embedding"]

client = chromadb.HttpClient(host="localhost", port=8000)
collection = client.get_collection("home_agent_memories")

docs = [
    "Tomie is the correct spelling of the users name, pronounced Tommy.",
    "Users birthday is March 21st 1977. He is an Aries.",
    "Users favorite color is pink.",
    "User runs a YouTube channel focused on historical content.",
    "User is a developer and smart home enthusiast with deep interests in history, archaeology, and AI.",
    "User is located in St. James, Missouri.",
    "User prefers bedroom lights at 50% brightness during daytime hours."
]

ids = ["seed-001","seed-002","seed-003","seed-004","seed-005","seed-006","seed-007","seed-008","seed-009","seed-010"]
types = ["fact","fact","preference","fact","fact","fact","preference","preference","preference","preference"]
now = time.time()

print("Generating embeddings via Ollama nomic-embed-text...")
embeddings = []
for i, doc in enumerate(docs):
    emb = get_embedding(doc)
    embeddings.append(emb)
    print(f"  {i+1}/{len(docs)} done - dim={len(emb)}")

collection.add(
    ids=ids,
    documents=docs,
    embeddings=embeddings,
    metadatas=[{"type":t,"importance":1.0,"extracted_at":now,"last_accessed":now,"memory_id":mid} for t,mid in zip(types,ids)]
)
print("Done. New count:", collection.count())
"@