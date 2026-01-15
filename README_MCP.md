# 🦆 Conectar Ducky a Claude Desktop

Puedes usar a Ducky directamente dentro de la app de Claude para escritorio usando MCP.

## Pasos para instalar

1.  Asegúrate de tener instalado `uv` (es un gestor de paquetes de Python ultra rápido, recomendado para MCP) o usa el python de tu sistema.
    *   Si no tienes `uv`, instálalo o usa la ruta completa a tu ejecutable de `python`.

2.  Abre el archivo de configuración de Claude Desktop:
    *   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
    *   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

3.  Añade la siguiente entrada dentro del bloque `"mcpServers"`. 
    *(Asegúrate de cambiar `/Users/izandegeer/...` por la ruta real donde está la carpeta `Ducky`)*.

```json
{
  "mcpServers": {
    "ducky": {
      "command": "python3",
      "args": [
        "/Users/izandegeer/Library/Mobile Documents/com~apple~CloudDocs/Projects/Dev's/Ducky/mcp_server.py"
      ]
    }
  }
}
```

> **Nota:** Si usas un entorno virtual (`venv`), sustituye `"python3"` por la ruta absoluta a tu python del entorno:
> `"/Users/izandegeer/.../Ducky/venv/bin/python"`

4.  Reinicia Claude Desktop.
5.  Ahora verás un icono de 🔌 (enchufe) o herramientas nuevas. Busca el prompt **"ducky_debug"** o usa la herramienta.

¡A disfrutar del debugging socrático integrado! 🦆