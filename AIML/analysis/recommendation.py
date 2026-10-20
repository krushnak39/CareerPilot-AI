class SkillRecommendation:

    @staticmethod
    def recommend(missing):

        recommendations = {}

        for skill in missing:

            if skill.lower() == "aws":
                recommendations[skill] = "Learn AWS cloud fundamentals and deployment."

            elif skill.lower() == "linux":
                recommendations[skill] = "Learn Linux commands, shell scripting, and server administration."

            elif skill.lower() == "rest api":
                recommendations[skill] = "Learn REST API design, HTTP methods, and API development."

            else:
                recommendations[skill] = f"Improve your knowledge and practical experience in {skill}."

        return recommendations