"""Content moderation for user posts.

- Fast keyword safety net (locally, deterministic)
- AI moderation via Emergent LLM (LiteLLM/OpenAI compatible)

Returns: (allowed: bool, reason: str)
"""
import os
import re
from typing import Tuple

# Deliberately conservative keyword list \u2014 blocks obvious explicit / 18+ / hate terms.
# Kept small on purpose; the AI layer catches the nuance.
_BLOCK_PATTERNS = [
    r"\b(porn|pornographic|xxx|nsfw|18\+|sex\s?video|nude|naked\s+photo)\b",
    r"\b(f[u\*]ck|sh[i\*]t|b[i\*]tch|c[u\*]nt|d[i\*]ck|a[s\*]{2}hole)\b",
    r"\b(kill\s+yourself|kys|suicide\s+method)\b",
    r"\b(rape|molest|paedo|pedo)\b",
    r"\b(nigger|chink|paki|retard)\b",
]

_BLOCK_RE = re.compile("|".join(_BLOCK_PATTERNS), re.IGNORECASE)


def keyword_check(text: str) -> Tuple[bool, str]:
    if not text:
        return True, ""
    m = _BLOCK_RE.search(text)
    if m:
        return False, f"Contains disallowed language ({m.group(0)!r})."
    return True, ""


async def ai_moderate(text: str) -> Tuple[bool, str]:
    """Ask an LLM to classify the text. Fails open (allows) if AI unavailable \u2014
    the keyword layer is the last guard."""
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key or not text.strip():
        return True, ""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception:
        return True, ""

    system = (
        "You are a strict content moderator for a cultural preservation community. "
        "Return exactly one word: ALLOW or BLOCK. "
        "Block if the text contains sexually explicit, pornographic, 18+, gratuitous violence, "
        "self-harm instructions, hate speech targeting any ethnicity/religion, or explicit slurs. "
        "Allow ordinary cultural, personal, and everyday content \u2014 including mentions of ritual, "
        "food, drink, festivals and love songs. Reply with ONLY 'ALLOW' or 'BLOCK'."
    )
    try:
        chat = (
            LlmChat(api_key=key, session_id=f"mod-{os.urandom(4).hex()}", system_message=system)
            .with_model("openai", "gpt-4o-mini")
        )
        resp = await chat.send_message(UserMessage(text=text[:4000]))
        verdict = (resp or "").strip().upper()
        if verdict.startswith("BLOCK"):
            return False, "Blocked by content policy (18+ / explicit / hate)."
        return True, ""
    except Exception:
        # Fail open \u2014 the keyword net still applies.
        return True, ""


async def moderate(text: str) -> Tuple[bool, str]:
    ok, why = keyword_check(text)
    if not ok:
        return False, why
    return await ai_moderate(text)
