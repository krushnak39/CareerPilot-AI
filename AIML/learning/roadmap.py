class LearningRoadmap:

    learning_resources = {
        "html": [
            "Learn HTML fundamentals",
            "Practice semantic HTML and forms",
            "Build a small webpage"
        ],

        "css": [
            "Learn CSS fundamentals",
            "Practice Flexbox and Grid",
            "Build responsive webpages"
        ],

        "programming": [
            "Learn programming fundamentals",
            "Practice variables, conditions, loops, and functions",
            "Solve basic programming problems"
        ],

        "java": [
            "Learn Java fundamentals",
            "Practice object-oriented programming in Java",
            "Build a small Java project"
        ],

        "rest api": [
            "Learn HTTP methods and status codes",
            "Learn REST API design principles",
            "Build REST APIs using FastAPI"
        ],

        "django": [
            "Learn Django fundamentals",
            "Learn Django models, views, and URLs",
            "Build a small Django application"
        ],

        "aws": [
            "Learn AWS cloud fundamentals",
            "Learn EC2, S3, IAM, and basic networking",
            "Deploy a small application on AWS"
        ],

        "linux": [
            "Learn Linux command-line fundamentals",
            "Practice file, process, and permission management",
            "Learn basic shell scripting"
        ]
    }

    learning_duration = {
        "html": "1 week",
        "css": "1-2 weeks",
        "programming": "2-3 weeks",
        "java": "2-3 weeks",
        "rest api": "1-2 weeks",
        "django": "2-3 weeks",
        "aws": "2-3 weeks",
        "linux": "1 week"
    }

    foundational_skills = {
        "programming",
        "html",
        "linux"
    }

    learning_dependencies = {
        "html": [],
        "css": ["html"],
        "programming": [],
        "java": ["programming"],
        "rest api": ["programming"],
        "django": ["programming"],
        "linux": []
    }

    @staticmethod
    def generate(career, missing_skills, priority_skills=None):

        if not missing_skills:
            return []

        if priority_skills is None:
            priority_skills = []

        priority_skills = {
            skill.lower()
            for skill in priority_skills
        }

        roadmap = []

        for skill in missing_skills:

            skill_name = skill.strip()
            skill_key = skill_name.lower()

            # Determine priority
            if skill_key in priority_skills:
                priority = "High"
                reason = (
                    f"{skill_name} is a high-priority skill "
                    f"for becoming a {career}."
                )

            elif skill_key in LearningRoadmap.foundational_skills:
                priority = "High"
                reason = (
                    f"{skill_name} is a foundational skill "
                    f"that should be developed early for a {career}."
                )

            else:
                priority = "Medium"
                reason = (
                    f"{skill_name} is a useful skill "
                    f"for becoming a {career}."
                )

            resources = LearningRoadmap.learning_resources.get(
                skill_key,
                [
                    f"Learn {skill_name} fundamentals",
                    f"Practice {skill_name} with hands-on exercises",
                    f"Build a small project using {skill_name}"
                ]
            )

            duration = LearningRoadmap.learning_duration.get(
                skill_key,
                "1-2 weeks"
            )

            dependencies = LearningRoadmap.learning_dependencies.get(
                skill_key,
                []
            )

            roadmap.append({
                "skill": skill_name,
                "priority": priority,
                "reason": reason,
                "resources": resources,
                "learning_duration": duration,
                "learning_order": 0,
                "dependencies": dependencies,
                "goal": f"become job-ready for {career}"
            })

        # ---------------------------------------------------------
        # Sort roadmap based on learning dependencies
        #
        # Example:
        # HTML -> CSS
        # Programming -> Java
        # Programming -> Django
        # ---------------------------------------------------------

        def learning_priority(item):

            skill = item["skill"].lower()

            dependencies = LearningRoadmap.learning_dependencies.get(
                skill,
                []
            )

            # Skills without dependencies should come first.
            dependency_count = len(dependencies)

            return (
                0 if not dependencies else 1,
                dependency_count,
                item["skill"].lower()
            )

        roadmap.sort(key=learning_priority)

        # Assign final learning order
        for index, item in enumerate(roadmap, start=1):
            item["learning_order"] = index

        return roadmap