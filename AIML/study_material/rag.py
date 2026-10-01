from study_material.extractor import StudyMaterialExtractor
from study_material.chunker import TextChunker
from study_material.retriever import Retriever
from study_material.generator import LLMGenerator


class RAGPipeline:

    def __init__(self, file_path):

        print("\n[1] Extracting study material...")

        text = StudyMaterialExtractor.extract_text(file_path)

        if not text.strip():
            raise ValueError("No text found in study material.")

        print("Extraction completed.")

        print("\n[2] Creating chunks...")

        self.chunks = TextChunker.chunk_text(
            text,
            chunk_size=500,
            overlap=50
        )
        print("\n======ALL CHUNKS======")
        for i, chunk in enumerate(self.chunks, start=1):
            print(f"Chunk {i}: {chunk}")

        if not self.chunks:
            raise ValueError("No chunks created.")

        print("Chunks created:", len(self.chunks))

        print("\n[3] Creating retriever...")

        self.retriever = Retriever(self.chunks)

        print("Retriever ready.")

        print("\n[4] Loading LLM...")

        self.generator = LLMGenerator()

        print("LLM ready.")

    def ask(self, question, top_k=3):

        results = self.retriever.retrieve(
            question,
            top_k=top_k
        )
        print("\n======Retrieved Context======")
        for i, result in enumerate(results,start=1):
            print(f"\nResult {i}:")
            print("Chunk:",result["chunk"]) 
            print("Distance: ", result['distance'])

        if not results:
            return "I could not find relevant information in the study material."

        context = "\n\n".join(
            result["chunk"]
            for result in results
        )

        answer = self.generator.generate(
            question,
            context
        )

        return answer


if __name__ == "__main__":

    print("\n========== CAREERPILOT AI ==========")

    file_path = input(
        "\nEnter study material path: "
    )

    rag = RAGPipeline(file_path)

    while True:

        question = input(
            "\nAsk a question "
            "(type 'exit' to quit): "
        )

        if question.lower() == "exit":
            print("\nExiting...")
            break

        answer = rag.ask(question)

        print("\n========== AI ANSWER ==========")
        print(answer)