from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import openai

app = FastAPI()

# Modelo de datos para la petición del chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    apiKey: Optional[str] = None

# Cargar el System Prompt
try:
    with open("system_prompt.txt", "r", encoding="utf-8") as f:
        SYSTEM_PROMPT = f.read()
except FileNotFoundError:
    SYSTEM_PROMPT = "Eres un asistente de programación útil."

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    api_key = request.apiKey or os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=401, detail="Se requiere una API Key de OpenAI. Ingrésala en la configuración o en el .env")

    client = openai.AsyncOpenAI(api_key=api_key)

    # Preparar mensajes incluyendo el System Prompt al inicio
    messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Convertir el modelo Pydantic a dict
    for msg in request.messages:
        messages_payload.append(msg.dict())

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini", # Usamos mini por velocidad y coste, es suficiente para Ducky
            messages=messages_payload,
            temperature=0.7
        )
        return {"response": response.choices[0].message.content}
    
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Servir el frontend
@app.get("/")
async def serve_index():
    return FileResponse("index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/img", StaticFiles(directory="img"), name="img")

if __name__ == "__main__":
    import uvicorn
    print("🦆 Ducky está nadando en http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)