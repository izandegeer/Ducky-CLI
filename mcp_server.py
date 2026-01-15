from mcp.server.fastmcp import FastMCP
import os

# Inicializamos el servidor MCP
mcp = FastMCP("Ducky 🦆")

# Cargamos el System Prompt (la personalidad del pato)
try:
    with open("system_prompt.txt", "r", encoding="utf-8") as f:
        SYSTEM_PROMPT = f.read()
except FileNotFoundError:
    SYSTEM_PROMPT = "Eres un patito de goma experto en programación. Ayuda al usuario a encontrar errores haciéndole preguntas."

@mcp.prompt()
def ducky_debug(code: str = "") -> str:
    """
    Invoca al Pato de Goma para debuggear el código seleccionado o un problema específico.
    """
    return [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": f"Aquí tienes el código o contexto que quiero debuggear:\n\n{code}\n\nAyúdame a encontrar el error pensando paso a paso."
        }
    ]

@mcp.tool()
def ask_ducky_concept(concept: str) -> str:
    """
    Pregunta a Ducky sobre un concepto de programación confuso para que te lo explique con analogías sencillas.
    """
    return f"Responde como Ducky (el patito de goma socrático) explicando este concepto de forma simple y divertida: {concept}"

if __name__ == "__main__":
    # El servidor MCP corre sobre stdio por defecto para conectarse con Claude Desktop
    mcp.run()
