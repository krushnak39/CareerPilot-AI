import json
import re
from pathlib import Path


class SkillNormalizer:
    def __init__(self):
        knowledge_path = Path(__file__).parent / "knowledge" / "skills.json"

        with open(knowledge_path, "r", encoding="utf-8") as file:
            self.skills = json.load(file)

    def normalize(self, text):
        if not text or not text.strip():
            return []

        text_lower = text.lower()

        detected_skills = []

        for skill_id, skill_data in self.skills.items():

            for alias in skill_data["aliases"]:

                pattern = r"\b" + re.escape(alias.lower()) + r"\b"

                if re.search(pattern, text_lower):
                    detected_skills.append({
                        "id": skill_id,
                        "name": skill_data["name"],
                        "matched_alias": alias
                    })

                    break

        return detected_skills