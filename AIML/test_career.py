from AIML.career.recommender import CareerRecommender


recommender = CareerRecommender()


profiles = [

    {
        "name": "Software Profile",
        "domain": "software_it",
        "skills": [
            "python",
            "sql",
            "fastapi",
            "docker"
        ]
    },

    {
        "name": "Mechanical Profile",
        "domain": "mechanical",
        "skills": [
            "solidworks",
            "autocad",
            "catia",
            "cad",
            "mechanical design"
        ]
    },

    {
        "name": "Civil Profile",
        "domain": "civil",
        "skills": [
            "autocad",
            "revit",
            "structural analysis",
            "construction"
        ]
    },

    {
        "name": "Finance Profile",
        "domain": "business_finance",
        "skills": [
            "excel",
            "accounting",
            "financial analysis",
            "finance"
        ]
    }
]


for profile in profiles:

    print("\n========================================")
    print("PROFILE:", profile["name"])
    print("DOMAIN:", profile["domain"])
    print("========================================")

    results = recommender.recommend(
        profile["skills"],
        profile["domain"]
    )

    if not results:

        print("No career recommendations found.")

        continue

    for i, result in enumerate(
        results[:3],
        start=1
    ):

        print(f"\n{i}. {result['career']}")

        print(
            "Score:",
            result["score"],
            "%"
        )

        print(
            "Matched:",
            result["matched_skills"]
        )

        print(
            "Missing:",
            result["missing_skills"]
        )