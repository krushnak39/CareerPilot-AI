class SkillGapAnalyzer:

    @staticmethod
    def analyze(matched, missing):

        priority_skills = []

        high_priority = ["aws", "python", "sql", "docker", "fastapi", "rest api"]

        for skill in missing:
            if skill.lower() in high_priority:
                priority_skills.append(skill)

        return {
            "matched_skills": matched,
            "missing_skills": missing,
            "total_matched": len(matched),
            "total_missing": len(missing),
            "priority_skills": priority_skills
        }