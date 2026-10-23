import re


def _sentences(text):
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [p.strip() for p in parts if 30 <= len(p.strip()) <= 300]


_DEF = re.compile(
    r"^(?P<term>[A-Z][\w\+\#\.\- ]{1,40}?)\s+"
    r"(?:is|are|refers to|means|provides|allows|helps)\s+(?P<rest>.+)$"
)


class FlashcardGenerator:
    """Deterministic flashcards from study material (no LLM needed)."""

    @staticmethod
    def generate(text, limit=10):
        cards, seen = [], set()
        for s in _sentences(text):
            m = _DEF.match(s)
            if not m:
                continue
            term = m.group("term").strip()
            if term.lower() in seen or len(term.split()) > 4:
                continue
            seen.add(term.lower())
            cards.append({
                "front": f"What is {term}?" if " is " in s or " are " in s
                         else f"Explain {term}.",
                "back": s,
                "topic": term,
            })
            if len(cards) >= limit:
                break

        # Fallback: cloze-style cards from key sentences
        if len(cards) < limit:
            for s in _sentences(text):
                if any(c["back"] == s for c in cards):
                    continue
                words = [w for w in re.findall(r"[A-Za-z][A-Za-z\+\#\-]{5,}", s)]
                if not words:
                    continue
                key = max(words, key=len)
                cards.append({
                    "front": s.replace(key, "_____", 1),
                    "back": key,
                    "topic": key,
                })
                if len(cards) >= limit:
                    break
        return cards
