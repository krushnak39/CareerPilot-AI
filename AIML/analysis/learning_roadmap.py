class LearningRoadmap:

    @staticmethod
    def generate(missing_skills, priority_skills, career):
        roadmap = []

        for skill in priority_skills:
            if skill == "rest api":
                roadmap.append({
                    "skill": "rest api",
                    "priority": "High",
                    "goal": f"become job-ready for {career}",
                    "estimated_duration": "1-2 weeks",
                    "reason": "REST API is a high-priority skill for becoming a Backend Developer.",
                    "resources": [
                        "REST API fundamentals",
                        "HTTP methods and status codes",
                        "API development with FastAPI",
                        "API authentication"
                    ]
                })

            elif skill == "aws":
                roadmap.append({
                    "skill": "aws",
                    "priority": "High",
                    "goal": f"become job-ready for {career}",
                    "estimated_duration": "2-3 weeks",
                    "reason": "AWS is a high-priority skill for becoming a Backend Developer.",
                    "resources": [
                        "AWS cloud fundamentals",
                        "EC2 and deployment",
                        "S3",
                        "IAM"
                    ]
                })

        for skill in missing_skills:
            if skill not in priority_skills and skill == "linux":
                roadmap.append({
                    "skill": "linux",
                    "priority": "Medium",
                    "goal": f"become job-ready for {career}",
                    "estimated_duration": "1 week",
                    "reason": "Linux is a useful skill for becoming a Backend Developer.",
                    "resources": [
                        "Linux fundamentals",
                        "File system and permissions",
                        "Linux commands",
                        "Process management"
                    ]
                })

        return roadmap