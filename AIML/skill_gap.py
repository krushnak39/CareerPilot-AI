import json
import re
from pathlib import Path


class SkillGapAnalyzer:

    def __init__(self):

        knowledge_path = (
            Path(__file__).parent
            / "knowledge"
            / "careers.json"
        )

        with open(
            knowledge_path,
            "r",
            encoding="utf-8"
        ) as file:
            self.careers = json.load(file)

    def analyze(self, profile_text, career):

        if not profile_text or not profile_text.strip():
            return None

        if career not in self.careers:
            raise ValueError(
                f"Career not found: {career}"
            )

        profile_lower = profile_text.lower()

        required_skills = self.careers[career]["skills"]

        matched_skills = []
        missing_skills = []

        for skill in required_skills:

            pattern = r"\b" + re.escape(skill.lower()) + r"\b"

            if re.search(pattern, profile_lower):
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

        total_skills = len(required_skills)

        if total_skills == 0:
            skill_score = 0
        else:
            skill_score = (
                len(matched_skills)
                / total_skills
            ) * 100

        gap_percentage = 100 - skill_score

        return {
            "career": career,
            "required_skills": required_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_score": round(skill_score, 2),
            "gap_percentage": round(gap_percentage, 2)
        }


if __name__ == "__main__":

    print("\n========== CAREERPILOT SKILL GAP ANALYZER ==========")

    analyzer = SkillGapAnalyzer()

    profile = """
    B.Tech Computer Science student.

    Skills:
    Python
    FastAPI
    SQL
    Docker
    Git
    """

    career = "Backend Developer"

    result = analyzer.analyze(
        profile,
        career
    )

    print("\nCareer:", result["career"])

    print("\nRequired Skills:")
    for skill in result["required_skills"]:
        print("-", skill)

    print("\nMatched Skills:")
    for skill in result["matched_skills"]:
        print("-", skill)

    print("\nMissing Skills:")
    for skill in result["missing_skills"]:
        print("-", skill)

    print("\nSkill Score:", result["skill_score"], "%")
    print("Skill Gap:", result["gap_percentage"], "%")