import json
from pathlib import Path

from AIML.semantic.matcher import SemanticMatcher


class CareerRecommender:

    def __init__(self):

        knowledge_path = (
            Path(__file__).parent.parent
            / "knowledge"
            / "careers.json"
        )

        with open(
            knowledge_path,
            "r",
            encoding="utf-8"
        ) as file:
            self.careers = json.load(file)

        self.matcher = SemanticMatcher()

    def recommend(self, skills, domain=None):

        if not skills:
            return []

        results = []

        for career, career_data in self.careers.items():

            career_domain = career_data["domain"]
            required_skills = career_data["skills"]

            # If a domain is provided, only recommend
            # careers from that domain.
            if domain and career_domain != domain:
                continue

            matches = self.matcher.find_matches(
                skills,
                required_skills,
                threshold=0.70
            )

            matched_required = {}

            for match in matches:

                required_skill = match["required_skill"]

                if (
                    required_skill not in matched_required
                    or match["score"]
                    > matched_required[required_skill]["score"]
                ):
                    matched_required[required_skill] = match

            matched = list(matched_required.keys())

            missing = [
                skill
                for skill in required_skills
                if skill not in matched_required
            ]

            if not required_skills:
                continue

            score = (
                len(matched)
                / len(required_skills)
            ) * 100

            results.append({
                "career": career,
                "domain": career_domain,
                "score": round(score, 2),
                "matched_skills": matched,
                "semantic_matches": list(
                    matched_required.values()
                ),
                "missing_skills": missing
            })

        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return results

    @staticmethod
    def save(
        results,
        filename="career_recommendations.json"
    ):

        with open(
            filename,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                results[:3],
                file,
                indent=4
            )

        print(
            f"\nCareer recommendations "
            f"saved to {filename}"
        )

    @staticmethod
    def best_match(results):

        if not results:
            return None

        return results[0]