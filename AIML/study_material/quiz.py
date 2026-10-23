import random
import re

from AIML.study_material.flashcards import _sentences


class QuizGenerator:
    """Deterministic MCQ quiz from study material (fill-in-the-blank)."""

    @staticmethod
    def generate(text, limit=5, seed=42):
        rng = random.Random(seed)
        sents = _sentences(text)
        vocab = sorted({
            w for s in sents
            for w in re.findall(r"[A-Za-z][A-Za-z\+\#\-]{5,}", s)
        })
        questions = []
        for s in sents:
            words = re.findall(r"[A-Za-z][A-Za-z\+\#\-]{5,}", s)
            if not words:
                continue
            answer = max(words, key=len)
            pool = [w for w in vocab if w.lower() != answer.lower()]
            if len(pool) < 3:
                continue
            options = rng.sample(pool, 3) + [answer]
            rng.shuffle(options)
            questions.append({
                "question": "Fill in the blank: " + s.replace(answer, "_____", 1),
                "options": options,
                "answerIndex": options.index(answer),
                "explanation": s,
                "topic": answer,
            })
            if len(questions) >= limit:
                break
        return questions
