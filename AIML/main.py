from AIML.parser.resume_parser import ResumeParser
from AIML.parser.extractor import ResumeExtractor

from AIML.ats.scorer import ATSScorer
from AIML.analysis.recommendation import SkillRecommendation
from AIML.analysis.report import ATSReport

from AIML.career_engine import CareerEngine


RESUME_PATH = "AIML/data/sample_resume.pdf"
JOB_DESCRIPTION_PATH = "AIML/data/job_description.txt"


def main():

    print("\n========== CAREERPILOT AI ==========")

    # ==========================================
    # 1. RESUME PARSING
    # ==========================================

    parser = ResumeParser(RESUME_PATH)

    resume_text = parser.extract_text()

    if not resume_text.strip():
        print("Could not extract text from resume.")
        return

    print("\n========== RESUME ==========")

    name = ResumeExtractor.extract_name(resume_text)
    email = ResumeExtractor.extract_email(resume_text)
    phone = ResumeExtractor.extract_phone(resume_text)

    print("Name:", name)
    print("Email:", email)
    print("Phone:", phone)

    # ==========================================
    # 2. ATS ANALYSIS
    # ==========================================

    resume_skills = ResumeExtractor.extract_skills(
        resume_text
    )

    with open(
        JOB_DESCRIPTION_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        job_description = file.read()

    jd_skills = []

    for skill in [
        "Python",
        "FastAPI",
        "Docker",
        "Git",
        "AWS",
        "MongoDB",
        "SQL",
        "REST API",
        "Linux"
    ]:
        if skill.lower() in job_description.lower():
            jd_skills.append(skill)

    ats_result = ATSScorer.calculate_score(
        resume_skills,
        jd_skills
    )

    print("\n========== ATS RESULT ==========")

    print(
        "ATS SCORE:",
        ats_result["score"],
        "%"
    )

    print("\nMATCHED SKILLS:")

    for skill in ats_result["matched"]:
        print("-", skill)

    print("\nMISSING SKILLS:")

    for skill in ats_result["missing"]:
        print("-", skill)

    # ==========================================
    # 3. ATS RECOMMENDATIONS
    # ==========================================

    recommendations = (
        SkillRecommendation.recommend(
            ats_result["missing"]
        )
    )

    print("\n========== ATS RECOMMENDATIONS ==========")

    for skill, recommendation in recommendations.items():
        print(
            f"- {skill}: {recommendation}"
        )

    # ==========================================
    # 4. ATS REPORT
    # ==========================================

    priority_skills = [
        skill
        for skill in ats_result["missing"]
        if skill.lower()
        in [
            "aws",
            "python",
            "sql",
            "docker",
            "fastapi",
            "rest api"
        ]
    ]

    report = ATSReport.generate(
        ats_result["score"],
        ats_result["matched"],
        ats_result["missing"],
        priority_skills,
        recommendations
    )

    ATSReport.save(
        report,
        "AIML/ats_report.json"
    )

    # ==========================================
    # 5. CAREER INTELLIGENCE
    # ==========================================

    print("\n========== CAREER INTELLIGENCE ==========")

    engine = CareerEngine()

    career_result = engine.analyze(
        resume_text
    )

    domain = career_result["domain"]

    print(
        "\nDomain:",
        domain["domain_name"]
    )

    print(
        "Confidence:",
        domain["confidence"]
    )

    print("\nDetected Skills:")

    for skill in career_result["skills"]:
        print(
            "-",
            skill["name"]
        )

    # ==========================================
    # 6. CAREER RECOMMENDATIONS
    # ==========================================

    print(
        "\n========== CAREER RECOMMENDATIONS =========="
    )

    career_recommendations = (
        career_result[
            "career_recommendations"
        ]
    )

    for index, career in enumerate(
        career_recommendations[:3],
        start=1
    ):

        print(
            f"\n{index}. {career['career']}"
        )

        print(
            "Match Score:",
            career["match_score"],
            "%"
        )

        print(
            "Skill Score:",
            career["skill_score"],
            "%"
        )

        print(
            "Skill Gap:",
            career["skill_gap"],
            "%"
        )

        print(
            "Matched:",
            career["matched_skills"]
        )

        print(
            "Missing:",
            career["missing_skills"]
        )

        print("Roadmap:")

        for item in career["roadmap"]:

            print(
                f"  {item['learning_order']}. "
                f"{item['skill']} "
                f"({item['priority']}, "
                f"{item['learning_duration']})"
            )

    print(
        "\n========== AIML ANALYSIS COMPLETE =========="
    )


if __name__ == "__main__":
    main()