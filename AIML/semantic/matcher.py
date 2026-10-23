import re
import zlib

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None


class _HashingEncoder:
    """Offline fallback when sentence-transformers is not installed.
    Character n-gram hashing vectors (no download needed)."""

    DIM = 512

    def encode(self, text):
        vec = np.zeros(self.DIM, dtype="float32")
        t = f" {text} "
        for n in (2, 3, 4):
            for i in range(len(t) - n + 1):
                vec[zlib.crc32(t[i:i + n].encode()) % self.DIM] += 1.0
        norm = np.linalg.norm(vec)
        return vec / norm if norm else vec


class SemanticMatcher:
    def __init__(self):
        self.model = None
        self.backend = "hashing-fallback"
        self._fallback = _HashingEncoder()
        self._cache = {}

        if SentenceTransformer is not None:
            try:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                self.backend = "sentence-transformers"
            except Exception as e:  # model download failed, offline etc.
                print("SentenceTransformer unavailable, using fallback:", e)

    @staticmethod
    def _normalize(text):
        return " ".join(str(text).strip().lower().split())

    @staticmethod
    def _is_conflicting_substring(text1, text2):
        """Prevent false positives such as Java -> JavaScript, C -> C++."""
        if text1 == text2:
            return False
        return text1 in text2 or text2 in text1

    def _embed(self, text):
        if text not in self._cache:
            if self.model is not None:
                vec = self.model.encode(text, convert_to_numpy=True)
                vec = np.asarray(vec, dtype="float32")
                norm = np.linalg.norm(vec)
                vec = vec / norm if norm else vec
            else:
                vec = self._fallback.encode(text)
            self._cache[text] = vec
        return self._cache[text]

    def similarity(self, text1, text2):
        text1 = self._normalize(text1)
        text2 = self._normalize(text2)

        if text1 == text2:
            return 1.0
        if self._is_conflicting_substring(text1, text2):
            return 0.0

        score = float(np.dot(self._embed(text1), self._embed(text2)))

        # The fallback encoder is much less "semantic": be stricter.
        if self.model is None and score < 0.85:
            return 0.0
        return score

    def find_matches(self, user_skills, required_skills, threshold=0.70):
        matches = []
        for user_skill in user_skills:
            for required_skill in required_skills:
                score = self.similarity(user_skill, required_skill)
                if score >= threshold:
                    matches.append({
                        "user_skill": user_skill,
                        "required_skill": required_skill,
                        "score": round(score, 4),
                    })
        return matches
