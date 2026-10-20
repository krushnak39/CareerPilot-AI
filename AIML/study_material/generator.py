import requests


class LLMGenerator:

    def __init__(self, model="llama3.2:latest"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, question, context):

        prompt = f"""
You are a helpful AI study assistant.

Answer the user's question using ONLY the provided study material.

If the answer is not present in the study material, say:
"I could not find this information in the provided study material."

Study Material:
{context}

Question:
{question}

Answer:
"""

        response = requests.post(
            self.url,
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
        )

        response.raise_for_status()

        data = response.json()

        return data["response"].strip()


if __name__ == "__main__":

    print("\n========== LLM GENERATOR TEST ==========")

    generator = LLMGenerator()

    context = """
    Docker is a containerization platform used to package applications.
    """

    question = "What is Docker?"

    answer = generator.generate(
        question,
        context
    )

    print("\nAI Answer:")
    print(answer)