class TextChunker:

    @staticmethod
    def chunk_text(text, chunk_size=500, overlap=50):

        if not text:
            return []

        chunks = []

        start = 0
        text_length = len(text)

        while start < text_length:

            end = start + chunk_size

            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            start += chunk_size - overlap

        return chunks


if __name__ == "__main__":

    sample_text = """
    Python is a programming language.
    FastAPI is a Python framework for building APIs.
    REST APIs use HTTP methods such as GET and POST.
    AWS provides cloud computing services.
    Docker is used for containerization.
    """

    chunks = TextChunker.chunk_text(
        sample_text,
        chunk_size=200,
        overlap=40
    )

    print("\n========== TEXT CHUNKS ==========")

    for i, chunk in enumerate(chunks, start=1):
        print(f"\nChunk {i}:")
        print(chunk)
        