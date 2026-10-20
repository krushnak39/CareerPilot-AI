from semantic.matcher import SemanticMatcher


matcher = SemanticMatcher()

user_skills = [
    "RESTful API development",
    "Python software development",
    "containerization with Docker"
]

required_skills = [
    "REST API",
    "Python",
    "Docker",
    "AWS"
]

matches = matcher.find_matches(
    user_skills,
    required_skills,
    threshold=0.70
)

print("\n========== SEMANTIC SKILL TEST ==========")

for match in matches:

    print(
        f"{match['user_skill']} "
        f"-> {match['required_skill']} "
        f"(similarity: {match['score']})"
    )