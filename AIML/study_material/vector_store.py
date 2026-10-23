import numpy as np

try:
    import faiss
except Exception:  # pragma: no cover
    faiss = None


class VectorStore:
    """FAISS vector store with a pure-numpy fallback."""

    def __init__(self, dimension):
        self.dimension = dimension
        self.chunks = []
        self.index = faiss.IndexFlatL2(dimension) if faiss else None
        self._vectors = np.empty((0, dimension), dtype="float32")

    @property
    def ntotal(self):
        return len(self.chunks)

    def add(self, embeddings, chunks):
        if len(embeddings) != len(chunks):
            raise ValueError("Number of embeddings must match number of chunks.")
        vectors = np.asarray(embeddings, dtype="float32")
        if self.index is not None:
            self.index.add(vectors)
        self._vectors = np.vstack([self._vectors, vectors])
        self.chunks.extend(chunks)

    def search(self, query_embedding, top_k=3):
        if not self.chunks:
            return []
        q = np.asarray([query_embedding], dtype="float32")
        top_k = min(top_k, len(self.chunks))

        if self.index is not None:
            distances, indices = self.index.search(q, top_k)
            pairs = zip(distances[0], indices[0])
        else:
            d = ((self._vectors - q) ** 2).sum(axis=1)
            order = np.argsort(d)[:top_k]
            pairs = zip(d[order], order)

        return [
            {"chunk": self.chunks[int(i)], "distance": float(d)}
            for d, i in pairs
            if int(i) != -1
        ]
