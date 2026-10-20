import re

class TextCleaner:
    @staticmethod
    def clean(text):
        text = re.sub(r"[ \t]+", " ",text)
        text = re.sub(r"\n{2,}", "\n",text)

        return text.strip()
    