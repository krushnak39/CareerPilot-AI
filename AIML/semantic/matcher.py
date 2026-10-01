import re

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim


class SemanticMatcher:

    def __init__(self):
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    @staticmethod
    def _normalize(text):
        return " ".join(str(text).strip().lower().split())

    @staticmethod
    def _is_conflicting_substring(text1, text2):
        """
        Prevent obvious false positives such as:
        Java -> JavaScript
        C -> C++
        """
        if text1 == text2:
            return False

        if text1 in text2 or text2 in text1:
            return True

        return False

    def similarity(self, text1, text2):

        text1 = self._normalize(text1)
        text2 = self._normalize(text2)

        if text1 == text2:
            return 1.0

        if self._is_conflicting_substring(text1, text2):
            return 0.0

        embedding1 = self.model.encode(
            text1,
            convert_to_tensor=True
        )

        embedding2 = self.model.encode(
            text2,
            convert_to_tensor=True
        )

        score = cos_sim(
            embedding1,
            embedding2
        )

        return float(score.item())

    def find_matches(
        self,
        user_skills,
        required_skills,
        threshold=0.70
    ):

        matches = []

        for user_skill in user_skills:

            for required_skill in required_skills:

                score = self.similarity(
                    user_skill,
                    required_skill
                )

                if score >= threshold:

                    matches.append({
                        "user_skill": user_skill,
                        "required_skill": required_skill,
                        "score": round(score, 4)
                    })

        return matches