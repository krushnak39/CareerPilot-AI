class ATSScorer:

    @staticmethod
    def calculate_score(resume_skills, jd_skills):

        resume_set = set(skill.lower() for skill in resume_skills)
        jd_set = set(skill.lower() for skill in jd_skills)

        matched = resume_set.intersection(jd_set)

        missing = jd_set - resume_set

        score = (len(matched) / len(jd_set)) * 100 if jd_set else 0

        return {
            "score": round(score, 2),
            "matched": list(matched),
            "missing": list(missing)
        }