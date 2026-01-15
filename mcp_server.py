from mcp.server.fastmcp import FastMCP
import os

# Initialize MCP Server
mcp = FastMCP("Ducky 🦆")

# Load System Prompt
try:
    with open("system_prompt.txt", "r", encoding="utf-8") as f:
        SYSTEM_PROMPT = f.read()
except FileNotFoundError:
    SYSTEM_PROMPT = "You are an expert rubber duck debugging assistant. Help the user find bugs by asking questions."

@mcp.prompt()
def ducky_debug(code: str = "") -> str:
    """
    Invokes the Rubber Duck to debug selected code or a specific problem.
    """
    return [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": f"Here is the code or context I want to debug:\n\n{code}\n\nHelp me find the error by thinking step by step."
        }
    ]

@mcp.tool()
def ask_ducky_concept(concept: str) -> str:
    """
    Ask Ducky about a confusing programming concept to get a simple, fun analogy explanation.
    """
    return f"Respond as Ducky (the Socratic rubber duck) explaining this concept simply and funnily: {concept}"

if __name__ == "__main__":
    # MCP server runs on stdio by default for Claude Desktop connection
    mcp.run()