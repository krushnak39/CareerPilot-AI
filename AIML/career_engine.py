from AIML.parser.resume_parser import ResumeParser
from AIML.domain_detector import DomainDetector
from AIML.career_matcher import CareerMatcher
from AIML.skill_gap import SkillGapAnalyzer
from AIML.skill_normalizer import SkillNormalizer
from AIML.career.recommender import CareerRecommender
from AIML.learning.roadmap import LearningRoadmap
from AIML.interview.question_generator import InterviewQuestionGenerator



class CareerEngine:

    def __init__(self):

        print("\nInitializing Career Intelligence Engine...")

        self.skill_normalizer = SkillNormalizer()
        self.domain_detector = DomainDetector()
        self.career_matcher = CareerMatcher()
        self.skill_gap_analyzer = SkillGapAnalyzer()
        self.career_recommender = CareerRecommender()
        self.learning_roadmap = LearningRoadmap()
        self.interview_generator = InterviewQuestionGenerator()


        print("Career Intelligence Engine ready.")

    def analyze(self, profile_text):

        if not profile_text or not profile_text.strip():
            raise ValueError(
                "Profile text cannot be empty."
            )

        # ------------------------------------------------
        # 1. Detect skills
        # ------------------------------------------------

        detected_skills = (
            self.skill_normalizer.normalize(
                profile_text
            )
        )
        normalized_skill_names = [
            skill["name"]
            for skill in detected_skills
        ]

        # ------------------------------------------------
        # 2. Detect domain
        # ------------------------------------------------

        domain_result = (
            self.domain_detector.detect(
                profile_text
            )
        )

        domain = domain_result["domain"]

        # ------------------------------------------------
        # 3. Match careers
        # ------------------------------------------------

        career_results = (
            self.career_recommender.recommend(
                normalized_skill_names,
                domain
            )
        )
        if (not domain or domain_result["confidence"] < 0.2):
            return {
        "domain": domain_result,
        "skills": detected_skills,
        "career_recommendations": [],
        "status": "insufficient_information",
        "message": (
            "More education, skills, or experience "
            "information is required for reliable "
            "career recommendations."
        )
        }
        # ------------------------------------------------
        # 4. Analyze skill gaps
        # ------------------------------------------------

        career_analysis = []

        for career_result in career_results[:5]:

            career = career_result["career"]

            gap = self.skill_gap_analyzer.analyze(
                profile_text,
                career
            )
            roadmap = self.learning_roadmap.generate(
                career,
                gap["missing_skills"]
            )
            interview_questions = self.interview_generator.generate(
                resume_text=profile_text,
                domain=domain,
                skills=detected_skills,
                career=career,
                missing_skills=gap["missing_skills"],
                limit=10
            )

            career_analysis.append({
                "career": career,
                "match_score": gap["skill_score"],
                "matched_skills": gap["matched_skills"],
                "missing_skills": gap["missing_skills"],
                "skill_score": gap["skill_score"],
                "skill_gap": gap["gap_percentage"], 
                "roadmap": roadmap,
                "interview_questions": interview_questions
            })

        # ------------------------------------------------
        # 5. Return complete analysis
        # ------------------------------------------------

        return {
            "domain": domain_result,
            "skills": detected_skills,
            "career_recommendations": career_analysis
        }

if __name__ == "__main__":

    print("\n========== CAREERPILOT AI ==========")

    resume_path = "AIML/data/sample_resume.pdf"

    parser = ResumeParser(resume_path)

    profile_text = parser.extract_text()

    if not profile_text.strip():
        print("Could not extract text from resume.")
        exit()

    engine = CareerEngine()

    result = engine.analyze(profile_text)

    print("\n========== DOMAIN ==========")
    print(
        "Domain:",
        result["domain"]["domain_name"]
    )

    print(
        "Confidence:",
        result["domain"]["confidence"]
    )

    print("\n========== DETECTED SKILLS ==========")

    for skill in result["skills"]:
        print(
            "-",
            skill["name"]
        )

    print("\n========== CAREER RECOMMENDATIONS ==========")

    for index, career in enumerate(
        result["career_recommendations"][:3],
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

        print("\nRoadmap:")

        for item in career["roadmap"]:
            print(
                f"  {item['learning_order']}. "
                f"{item['skill']} "
                f"({item['priority']}, "
                f"{item['learning_duration']})"
            )