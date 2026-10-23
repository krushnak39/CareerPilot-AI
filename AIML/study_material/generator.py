import os
import re

try:
    import requests
except Exception:  # pragma: no cover
    requests = None


class LLMGenerator:
    """Answers from study-material context.

    1. Uses a local Ollama model when it is running.
    2. Otherwise falls back to an extractive answer (best matching
       sentences from the retrieved context), so the feature still works.
    """

    def __init__(self, model=None):
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3.2:latest")
        self.url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        self.mode = "unknown"

    def generate(self, question, context):
        prompt = f"""
You are a helpful AI study assistant.

Answer the user's question using ONLY the provided study material.

If the answer is not present in the study material, say:
"I could not find this information in the provided study material."

Study Material:
{context}

Question:
{question}

Answer:
"""
        if requests is not None:
            try:
                response = requests.post(
                    self.url,
                    json={"model": self.model, "prompt": prompt, "stream": False},
                    timeout=60,
                )
                response.raise_for_status()
                self.mode = "ollama"
                return response.json()["response"].strip()
            except Exception:
                pass

        self.mode = "extractive"
        return self._extractive_answer(question, context)

    @staticmethod
    def _extractive_answer(question, context):
        stop = {"what", "is", "are", "the", "a", "an", "of", "to", "in", "how",
                "why", "does", "do", "and", "for", "on", "with", "explain",
                "define", "about", "tell", "me"}
        q_words = {w for w in re.findall(r"[a-z0-9\+\#]+", question.lower())
                   if w not in stop}
        sentences = re.split(r"(?<=[.!?])\s+|\n+", context)
        scored = []
        for s in sentences:
            s = s.strip()
            if len(s) < 20:
                continue
            words = set(re.findall(r"[a-z0-9\+\#]+", s.lower()))
            overlap = len(q_words & words)
            if overlap:
                scored.append((overlap, s))
        if not scored:
            return "I could not find this information in the provided study material."
        scored.sort(key=lambda x: -x[0])
        return " ".join(s for _, s in scored[:3])
