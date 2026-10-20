import json


class ATSReport:

    @staticmethod
    def generate(score, matched, missing, priority, recommendations):

        return {
            "ats_score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "priority_skills": priority,
            "recommendations": recommendations
        }

    @staticmethod
    def save(report, filename="ats_report.json"):

        with open(filename, "w") as file:
            json.dump(report, file, indent=4)

        print(f"\nReport saved to {filename}")