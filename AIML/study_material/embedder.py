from sentence_transformers import SentenceTransformer


class TextEmbedder:

    def __init__(self):
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    def embed(self, texts):

        if not texts:
            return []

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True
        )

        return embeddings


if __name__ == "__main__":

    embedder = TextEmbedder()

    chunks = [
        "Python is a programming language.",
        "FastAPI is used for building APIs.",
        "AWS provides cloud computing services."
    ]

    embeddings = embedder.embed(chunks)

    print("\n========== EMBEDDINGS ==========")
    print("Number of chunks:", len(embeddings))
    print("Embedding dimensions:", len(embeddings[0]))

    print("\nFirst embedding:")
    print(embeddings[0])
    