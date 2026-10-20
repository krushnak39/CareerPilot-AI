from collections import OrderedDict


class InterviewQuestionGenerator:
    """
    Generates personalized interview questions using:
    - detected domain
    - resume/profile text
    - detected skills
    - target career
    - missing skills

    This module is deterministic and does not require another API/model.
    """

    DOMAIN_QUESTIONS = {
        "software_it": [
            "Explain a software project you have worked on and your specific contribution.",
            "How do you approach debugging a problem in a software application?",
            "How do you decide which data structure or algorithm to use for a problem?",
            "How do you design a REST API for a real-world application?",
            "How do you handle errors and unexpected inputs in your applications?",
        ],
        "data_ai": [
            "Explain a data or machine-learning project you have worked on and your contribution.",
            "How do you preprocess and clean a real-world dataset?",
            "How do you choose an appropriate machine-learning model for a problem?",
            "How do you detect and prevent overfitting?",
            "How would you evaluate whether a machine-learning model is performing well?",
        ],
        "mechanical": [
            "Explain a mechanical design or manufacturing project you have worked on.",
            "How do you approach designing a mechanical component?",
            "How do you select appropriate materials for a mechanical design?",
            "How do CAD tools improve the mechanical design process?",
            "Explain a manufacturing problem you have encountered and how you would solve it.",
        ],
        "civil": [
            "Explain a civil engineering or construction project you have worked on.",
            "How do you approach planning and executing a construction project?",
            "How is surveying used during a construction project?",
            "How do you identify and address structural risks in a project?",
            "How do CAD and BIM tools improve civil engineering workflows?",
        ],
        "electrical": [
            "Explain an electrical engineering project you have worked on.",
            "How would you troubleshoot a fault in an electrical system?",
            "Explain the purpose of control systems in electrical engineering.",
            "How do power systems maintain reliable power delivery?",
            "How would you use MATLAB in an electrical engineering project?",
        ],
        "electronics": [
            "Explain an embedded or electronics project you have worked on.",
            "How would you troubleshoot an embedded system that is not working?",
            "What factors do you consider when selecting a microcontroller?",
            "Explain how sensors and microcontrollers can be combined in an IoT system.",
            "Explain a digital electronics concept you have applied in a project.",
        ],
        "business_finance": [
            "Explain a finance or business-analysis project you have worked on.",
            "How would you analyze the financial performance of a company?",
            "How do you use Excel in financial or business analysis?",
            "How would you identify an important trend in financial data?",
            "How do you communicate a financial analysis to a non-technical stakeholder?",
        ],
        "design": [
            "Explain a design project you have worked on and your design decisions.",
            "How do you approach understanding user requirements before designing a product?",
            "How do wireframes and prototypes help during the design process?",
            "How do you evaluate whether a UI design provides a good user experience?",
            "How do you incorporate user feedback into a design?",
        ],
    }

    BEHAVIORAL_QUESTIONS = [
        "Tell me about yourself and your background.",
        "Tell me about a challenging project you worked on.",
        "Describe a problem you faced during a project and how you solved it.",
        "Tell me about a time you had to learn a new skill quickly.",
        "Describe a situation where you worked as part of a team.",
    ]

    def generate(
        self,
        resume_text,
        domain,
        skills=None,
        career=None,
        missing_skills=None,
        limit=10,
    ):
        if not resume_text or not resume_text.strip():
            raise ValueError("Resume/profile text cannot be empty.")

        skills = skills or []
        missing_skills = missing_skills or []

        domain_id = self._normalize_domain(domain)
        career_name = career or "the target role"

        questions = []

        # 1. Resume-specific questions
        resume_questions = self._resume_questions(
            resume_text,
            skills,
            career_name
        )
        questions.extend(resume_questions)

        # 2. Domain-specific questions
        questions.extend(
            self.DOMAIN_QUESTIONS.get(
                domain_id,
                [
                    "Explain the most important project mentioned in your resume.",
                    "What technical skills are most important for your target role?",
                    "Describe how you would solve a difficult problem in your field.",
                ],
            )
        )

        # 3. Skill-specific questions
        for skill in skills:
            skill_name = self._skill_name(skill)

            questions.append(
                f"How have you used {skill_name} in a project or practical situation?"
            )

        # 4. Missing-skill questions
        for skill in missing_skills:
            skill_name = self._skill_name(skill)

            questions.append(
                f"What do you know about {skill_name}, and how would you learn it for a {career_name} role?"
            )

        # 5. Behavioral questions
        questions.extend(self.BEHAVIORAL_QUESTIONS)

        # Remove duplicate questions while preserving order
        unique_questions = list(
            OrderedDict.fromkeys(
                question.strip()
                for question in questions
                if question and question.strip()
            )
        )

        return [
            {
                "question_number": index,
                "question": question,
                "type": self._question_type(question),
                "career": career_name,
                "domain": domain_id,
            }
            for index, question in enumerate(
                unique_questions[:limit],
                start=1,
            )
        ]

    @staticmethod
    def _normalize_domain(domain):
        if isinstance(domain, dict):
            domain = domain.get("domain")

        if not domain:
            return "general"

        return str(domain).strip().lower()

    @staticmethod
    def _skill_name(skill):
        if isinstance(skill, dict):
            return skill.get("name", "")

        return str(skill).strip()

    @staticmethod
    def _resume_questions(resume_text, skills, career):
        questions = []

        # Ask directly about the candidate's strongest detected skills.
        for skill in skills[:3]:
            skill_name = InterviewQuestionGenerator._skill_name(skill)

            if skill_name:
                questions.append(
                    f"Your resume mentions {skill_name}. "
                    f"Can you explain how you used it and what you achieved?"
                )

        # Ask about project/experience evidence when present.
        resume_lower = resume_text.lower()

        if "project" in resume_lower:
            questions.append(
                f"Walk me through the most important project on your resume "
                f"and explain your contribution as a {career} candidate."
            )

        if "experience" in resume_lower:
            questions.append(
                "Describe the most important professional or practical "
                "experience mentioned in your resume."
            )

        return questions

    @staticmethod
    def _question_type(question):
        lower = question.lower()

        behavioral_words = [
            "tell me about yourself",
            "challenging project",
            "problem you faced",
            "learn a new skill",
            "worked as part of a team",
            "user feedback",
        ]

        if any(word in lower for word in behavioral_words):
            return "behavioral"

        if "resume mentions" in lower:
            return "resume_based"

        if "what do you know about" in lower:
            return "skill_gap"

        return "technical"