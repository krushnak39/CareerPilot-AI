from study_material.embedder import TextEmbedder
from study_material.vector_store import VectorStore


class Retriever:

    def __init__(self, chunks):

        self.chunks = chunks

        self.embedder = TextEmbedder()

        embeddings = self.embedder.embed(chunks)

        if len(embeddings) == 0:
            raise ValueError("No chunks available for retrieval.")

        dimension = len(embeddings[0])

        self.vector_store = VectorStore(dimension)

        self.vector_store.add(
            embeddings,
            chunks
        )

    def retrieve(self, query, top_k=3):

        if not query or not query.strip():
            return []

        query_embedding = self.embedder.embed(
            [query]
        )[0]

        return self.vector_store.search(
            query_embedding,
            top_k=top_k
        )


if __name__ == "__main__":

    print("\n========== RETRIEVER TEST ==========")

    chunks = [
        "Python is a programming language used for software development.",
        "FastAPI is a Python framework used for building REST APIs.",
        "AWS provides cloud computing services such as EC2 and S3.",
        "Docker is a containerization platform used to package applications."
    ]

    retriever = Retriever(chunks)

    query = input("\nEnter your question: ")

    results = retriever.retrieve(
        query,
        top_k=2
    )

    print("\n========== RETRIEVED CHUNKS ==========")

    for i, result in enumerate(results, start=1):

        print(f"\nResult {i}")
        print("Chunk:", result["chunk"])
        print("Distance:", result["distance"])

