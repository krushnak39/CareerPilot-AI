import re
import zlib

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None


class TextEmbedder:
    """all-MiniLM-L6-v2 embeddings, with an offline hashing fallback."""

    DIM = 768

    def __init__(self):
        self.model = None
        self.backend = "hashing-fallback"
        if SentenceTransformer is not None:
            try:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                self.backend = "sentence-transformers"
            except Exception as e:
                print("SentenceTransformer unavailable, using fallback:", e)

    def _hash_embed(self, text):
        vec = np.zeros(self.DIM, dtype="float32")
        words = re.findall(r"[a-z0-9\+\#\.]+", text.lower())
        for w in words:
            vec[zlib.crc32(w.encode()) % self.DIM] += 1.0
        for a, b in zip(words, words[1:]):
            vec[zlib.crc32(f"{a} {b}".encode()) % self.DIM] += 0.5
        norm = np.linalg.norm(vec)
        return vec / norm if norm else vec

    def embed(self, texts):
        if not texts:
            return []
        if self.model is not None:
            return self.model.encode(texts, convert_to_numpy=True)
        return np.array([self._hash_embed(t) for t in texts])
