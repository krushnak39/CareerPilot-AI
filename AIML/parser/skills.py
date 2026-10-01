SKILLS = [
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "FastAPI",
    "SQL",
    "MongoDB",
    "Docker",
    "Git",
    "AWS",
    "Linux",
    "REST API",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "HTML",
    "CSS"
]

import re


def extract_skills_from_text(text):
    if not text:
        return []

    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(pattern, text_lower):
            found_skills.append(skill)

    return found_skills