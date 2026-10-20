import faiss
import numpy as np


class VectorStore:

    def __init__(self, dimension):

        self.dimension = dimension

        self.index = faiss.IndexFlatL2(dimension)

        self.chunks = []

    def add(self, embeddings, chunks):

        if len(embeddings) != len(chunks):
            raise ValueError(
                "Number of embeddings must match number of chunks."
            )

        vectors = np.asarray(
            embeddings,
            dtype="float32"
        )

        self.index.add(vectors)

        self.chunks.extend(chunks)

    def search(self, query_embedding, top_k=3):

        if self.index.ntotal == 0:
            return []

        query_vector = np.asarray(
            [query_embedding],
            dtype="float32"
        )

        distances, indices = self.index.search(
            query_vector,
            top_k
        )

        results = []

        for distance, index in zip(
            distances[0],
            indices[0]
        ):

            if index == -1:
                continue

            results.append({
                "chunk": self.chunks[index],
                "distance": float(distance)
            })

        return results


if __name__ == "__main__":

    print("\n========== VECTOR STORE TEST ==========")

    chunks = [
        "Python is a programming language.",
        "FastAPI is used for building APIs.",
        "AWS provides cloud computing services."
    ]

    # Temporary test embeddings
    embeddings = np.random.rand(
        len(chunks),
        384
    ).astype("float32")

    store = VectorStore(384)

    store.add(
        embeddings,
        chunks
    )

    query_embedding = np.random.rand(
        384
    ).astype("float32")

    results = store.search(
        query_embedding,
        top_k=2
    )

    print("Total vectors:", store.index.ntotal)

    print("\nSearch Results:")

    for result in results:
        print("\nChunk:", result["chunk"])
        print("Distance:", result["distance"])
        