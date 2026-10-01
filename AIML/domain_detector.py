import json
from pathlib import Path


class DomainDetector:

    def __init__(self):

        knowledge_path = (
            Path(__file__).parent
            / "knowledge"
            / "domains.json"
        )

        with open(
            knowledge_path,
            "r",
            encoding="utf-8"
        ) as file:
            self.domains = json.load(file)

    @staticmethod
    def normalize_text(text):
        """
        Convert text to lowercase and remove
        unnecessary spaces.
        """
        return " ".join(
            str(text).lower().split()
        )

    def detect(self, text):

        # --------------------------------
        # Empty input
        # --------------------------------

        if not text or not text.strip():

            return {
                "domain": None,
                "domain_name": None,
                "confidence": 0,
                "matched_keywords": [],
                "education_matches": [],
                "experience_matches": []
            }

        # Normalize profile text
        text_normalized = self.normalize_text(text)

        domain_results = []

        # --------------------------------
        # Check every domain
        # --------------------------------

        for domain_id, domain_data in self.domains.items():

            matched_keywords = []
            education_matches = []
            experience_matches = []

            # --------------------------------
            # General domain keywords
            # --------------------------------

            for keyword in domain_data.get(
                "keywords",
                []
            ):

                keyword_normalized = self.normalize_text(
                    keyword
                )

                if (
                    keyword_normalized
                    and keyword_normalized in text_normalized
                ):
                    matched_keywords.append(keyword)

            # --------------------------------
            # Education keywords
            # --------------------------------

            for keyword in domain_data.get(
                "education_keywords",
                []
            ):

                keyword_normalized = self.normalize_text(
                    keyword
                )

                if (
                    keyword_normalized
                    and keyword_normalized in text_normalized
                ):
                    education_matches.append(keyword)

            # --------------------------------
            # Experience keywords
            # --------------------------------

            for keyword in domain_data.get(
                "experience_keywords",
                []
            ):

                keyword_normalized = self.normalize_text(
                    keyword
                )

                if (
                    keyword_normalized
                    and keyword_normalized in text_normalized
                ):
                    experience_matches.append(keyword)

            # --------------------------------
            # Calculate weighted score
            # --------------------------------

            score = (
                len(matched_keywords) * 1.0
                + len(education_matches) * 2.0
                + len(experience_matches) * 1.5
            )

            domain_results.append({

                "domain": domain_id,

                "domain_name": domain_data.get(
                    "name",
                    domain_id
                ),

                "score": score,

                "matched_keywords": matched_keywords,

                "education_matches": education_matches,

                "experience_matches": experience_matches
            })

        # --------------------------------
        # Sort domains by score
        # --------------------------------

        domain_results.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        # --------------------------------
        # Get best domain
        # --------------------------------

        best = domain_results[0]

        # --------------------------------
        # No match
        # --------------------------------

        if best["score"] == 0:

            return {
                "domain": None,
                "domain_name": None,
                "confidence": 0,
                "matched_keywords": [],
                "education_matches": [],
                "experience_matches": []
            }

        # --------------------------------
        # Confidence
        # --------------------------------

        confidence = min(
            best["score"] / 10,
            1.0
        )

        # --------------------------------
        # Final result
        # --------------------------------

        return {

            "domain": best["domain"],

            "domain_name": best["domain_name"],

            "confidence": round(
                confidence,
                2
            ),

            "matched_keywords":
                best["matched_keywords"],

            "education_matches":
                best["education_matches"],

            "experience_matches":
                best["experience_matches"]
        }


# ==================================================
# TESTING
# ==================================================

if __name__ == "__main__":

    detector = DomainDetector()

    print(
        "\n========== CAREERPILOT DOMAIN DETECTOR =========="
    )

    profiles = [

        # ------------------------------------------
        # PROFILE 1 - SOFTWARE
        # ------------------------------------------

        """
        B.Tech Computer Science Engineering graduate.

        Education: Computer Science Engineering.

        Skills: Python, FastAPI, SQL, Docker.

        Experience: Backend Development internship.
        Worked as a Software Developer intern.
        """,

        # ------------------------------------------
        # PROFILE 2 - MECHANICAL
        # ------------------------------------------

        """
        B.Tech Mechanical Engineering graduate.

        Education: Mechanical Engineering.

        Skills: SolidWorks, AutoCAD, CATIA.

        Experience: Mechanical Design Engineer.
        Worked in manufacturing and product design.
        """,

        # ------------------------------------------
        # PROFILE 3 - CIVIL
        # ------------------------------------------

        """
        B.Tech Civil Engineering graduate.

        Education: Civil Engineering.

        Skills: AutoCAD, Revit, Structural Analysis.

        Experience: Civil Engineer.
        Worked in construction and structural engineering.
        """,

        # ------------------------------------------
        # PROFILE 4 - FINANCE
        # ------------------------------------------

        """
        Bachelor of Commerce graduate.

        Education: B.Com in Commerce.

        Skills: Excel, Accounting, Financial Analysis.

        Experience: Accountant.
        Worked in banking and financial analysis.
        """
    ]

    # ------------------------------------------
    # Run profiles
    # ------------------------------------------

    for i, profile in enumerate(
        profiles,
        start=1
    ):

        result = detector.detect(profile)

        print(
            f"\nProfile {i}"
        )

        print(
            "-------------------------"
        )

        print(
            "Domain:",
            result["domain_name"]
        )

        print(
            "Confidence:",
            result["confidence"]
        )

        print(
            "Matched:",
            result["matched_keywords"]
        )

        print(
            "Education Matches:",
            result["education_matches"]
        )

        print(
            "Experience Matches:",
            result["experience_matches"]
        )