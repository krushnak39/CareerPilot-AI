from pathlib import Path

try:
    import fitz  # PyMuPDF
except Exception:  # pragma: no cover
    fitz = None


class ResumeParser:
    """Extracts text from PDF / DOCX / TXT resumes."""

    def __init__(self, pdf_path):
        self.pdf_path = str(pdf_path)

    def extract_text(self):
        suffix = Path(self.pdf_path).suffix.lower()

        try:
            if suffix == ".docx":
                return self._docx()
            if suffix == ".txt":
                return Path(self.pdf_path).read_text(
                    encoding="utf-8", errors="ignore"
                )
            return self._pdf()
        except Exception as e:
            print("Resume parse error:", e)
            return ""

    def _pdf(self):
        text = ""
        if fitz is not None:
            document = fitz.open(self.pdf_path)
            for page in document:
                text += page.get_text()
            document.close()
            if text.strip():
                return text

        from pypdf import PdfReader  # fallback

        reader = PdfReader(self.pdf_path)
        return "\n".join(
            (page.extract_text() or "") for page in reader.pages
        )

    def _docx(self):
        from docx import Document

        document = Document(self.pdf_path)
        return "\n".join(p.text for p in document.paragraphs)
