class ResumeParser:
    """Extract plain text from a PDF resume.

    Uses PyMuPDF (fitz) when available and falls back to pypdf, so the
    service still works in lightweight deployments.
    """

    def __init__(self, pdf_path):
        self.pdf_path = pdf_path

    def _extract_with_fitz(self):
        import fitz

        text = ""
        document = fitz.open(self.pdf_path)
        try:
            for page in document:
                text += page.get_text()
        finally:
            document.close()
        return text

    def _extract_with_pypdf(self):
        from pypdf import PdfReader

        reader = PdfReader(self.pdf_path)
        return "\n".join((page.extract_text() or "") for page in reader.pages)

    def extract_text(self):
        try:
            text = self._extract_with_fitz()
            if text.strip():
                return text
        except ImportError:
            pass
        except Exception as e:
            print("PyMuPDF error:", e)

        try:
            return self._extract_with_pypdf()
        except Exception as e:
            print("pypdf error:", e)
            return ""
