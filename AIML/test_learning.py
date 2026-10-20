from learning.roadmap import LearningRoadmap


career = "Backend Developer"

missing_skills = [
    "rest api",
    "aws",
    "linux"
]

priority_skills = [
    "rest api",
    "aws"
]


roadmap = LearningRoadmap.generate(
    career,
    missing_skills,
    priority_skills
)


print("\n========== LEARNING ROADMAP ==========")

for index, item in enumerate(roadmap, start=1):

    print(f"\n{item['learning_order']}. "f"{item['skill']}")
    print(f"Priority: {item['priority']}")
    print(f"Goal: {item['goal']}")
    print(f"Estimated Duration: {item['learning_duration']}")
    print(f"Reason: {item['reason']}")

    print("Resources:")
    for resource in item["resources"]:
        print(f"- {resource}")