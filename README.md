# 🦆 Ducky-CLI
> **The Official Socratic Debugging Extension (Universal MCP)**

Ducky is a context-aware Rubber Duck Debugging mentor. It helps you find bugs by asking Socratic questions instead of giving immediate solutions.

**Compatible with:**
- ✅ Google Gemini CLI
- ✅ Anthropic Claude Desktop
- ✅ Claude Code

---

## 📦 Installation

### Option A: For Gemini CLI
1. **Clone the repo:**
   ```bash
   git clone https://github.com/izandegeer/Ducky-CLI.git
   cd Ducky-CLI
   ```
2. **Install dependencies:**
   ```bash
   pip install mcp
   ```
3. **Link extension:**
   ```bash
   gemini extensions link .
   ```
4. **Usage:** Run `/ducky:start` in Gemini.

---

### Option B: For Claude (Desktop & Code)
1. **Clone and install dependencies** (same as above).
2. **Configure Claude:**
   - Open your config file:
     - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Add the following to `mcpServers` (replace PATH with your actual path):
     ```json
     "ducky": {
       "command": "python3",
       "args": ["/Users/YOUR_USER/.../Ducky-CLI/mcp_server.py"]
     }
     ```
3. **Usage:**
   - **Claude Desktop:** Click the 🔌 icon or use the Prompt Library (Book icon) and select `ducky_debug`.
   - **Claude Code:** Just ask "Use Ducky to debug this file".

---

## 🎮 Features
- **Socratic Logic:** Guides you to the answer instead of giving it.
- **Context Aware:** Can read your local files via MCP.
- **Visuals:** Built-in support for Mermaid diagrams.
- **Rage Mode:** A safe space to vent.

---
*Quack!* 🦆
