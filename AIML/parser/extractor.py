import re

from AIML.parser.skills import SKILLS


class ResumeExtractor:

    @staticmethod
    def extract_email(text):

        pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

        match = re.search(pattern, text)

        if match:
            return match.group()

        return None

    @staticmethod
    def extract_phone(text):

        pattern = r"(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}"

        match = re.search(pattern, text)

        if match:
            return match.group()

        return None

    @staticmethod
    def extract_name(text):

        lines = text.split("\n")

        for line in lines:

            line = line.strip()

            if len(line) > 2:
                return line

        return None

    @staticmethod
    def extract_skills(text):
        found = []
        text_lower = text.lower()

        for skill in SKILLS:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"

            if re.search(pattern, text_lower):
                found.append(skill)

        return found