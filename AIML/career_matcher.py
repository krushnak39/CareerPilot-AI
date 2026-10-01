import json
from pathlib import Path


class CareerMatcher:

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

    def match(self, profile_text, domain):


        if not profile_text or not profile_text.strip():
           return []

        if not domain:
           return []

        profile_lower = profile_text.lower()

        recommendations = []

        for career, career_data in self.careers.items():

            if career_data["domain"] != domain:
                continue

            matched_skills = []

            for skill in career_data["skills"]:

                if skill.lower() in profile_lower:
                    matched_skills.append(skill)

            total_skills = len(career_data["skills"])

            if total_skills == 0:
                continue

            skill_score = (
                len(matched_skills) / total_skills
        ) * 100

        # Small bonus when the career name itself
        # appears in the profile.
            career_bonus = 0

            career_words = career.lower().split()

            for word in career_words:

                if len(word) > 3 and word in profile_lower:
                    career_bonus += 5

            final_score = min(
                skill_score + career_bonus,
            100
        )

            recommendations.append({
            "career": career,
            "score": round(final_score, 2),
            "matched_skills": matched_skills,
            "missing_skills": [
                skill
                for skill in career_data["skills"]
                if skill not in matched_skills
            ]
        })

        recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

        return recommendations

if __name__ == "__main__":

    print("\n========== CAREERPILOT CAREER MATCHER ==========")

    matcher = CareerMatcher()

    profiles = [

        {
            "name": "Software Profile",
            "domain": "software_it",
            "text": """
            B.Tech Computer Science Engineering graduate.

            Skills: Python, FastAPI, SQL, Docker, JavaScript.

            Experience: Backend Developer Intern.
            Worked on REST API development and software projects.
            """
        },

        {
            "name": "Mechanical Profile",
            "domain": "mechanical",
            "text": """
            B.Tech Mechanical Engineering graduate.

            Skills: SolidWorks, AutoCAD, CATIA.

            Experience: Mechanical Design Engineer.
            Worked in manufacturing and product design.
            """
        },

        {
            "name": "Civil Profile",
            "domain": "civil",
            "text": """
            B.Tech Civil Engineering graduate.

            Skills: AutoCAD, Revit, Structural Analysis.

            Experience: Civil Engineer.
            Worked in construction and structural engineering.
            """
        },

        {
            "name": "Finance Profile",
            "domain": "business_finance",
            "text": """
            Bachelor of Commerce graduate.

            Education: B.Com in Commerce.

            Skills: Excel, Accounting, Financial Analysis.

            Experience: Accountant.
            Worked in banking and financial analysis.
            """
        }
    ]

    for profile in profiles:

        print("\n========================================")
        print("Profile:", profile["name"])
        print("Domain:", profile["domain"])
        print("========================================")

        recommendations = matcher.match(
            profile["text"],
            profile["domain"]
        )

        if not recommendations:
            print("No career recommendations found.")
            continue

        for i, recommendation in enumerate(
            recommendations,
            start=1
        ):

            print(f"\nRecommendation {i}")
            print("Career:", recommendation["career"])
            print("Score:", recommendation["score"])
            print(
                "Matched Skills:",
                recommendation["matched_skills"]
            )
            print(
                "Missing Skills:",
                recommendation["missing_skills"]
            )    