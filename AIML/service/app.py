"""CareerPilot AI service (Flask).

Run from the repository root:
    python -m AIML.service.app
"""
import hashlib
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for p in (str(ROOT), str(ROOT / "AIML")):
    if p not in sys.path:
        sys.path.insert(0, p)

from flask import Flask, jsonify, request  # noqa: E402

from AIML.ats.scorer import ATSScorer  # noqa: E402
from AIML.career_engine import CareerEngine  # noqa: E402
from AIML.parser.extractor import ResumeExtractor  # noqa: E402
from AIML.parser.resume_parser import ResumeParser  # noqa: E402
from AIML.study_material.chunker import TextChunker  # noqa: E402
from AIML.study_material.extractor import StudyMaterialExtractor  # noqa: E402
from AIML.study_material.flashcards import FlashcardGenerator  # noqa: E402
from AIML.study_material.generator import LLMGenerator  # noqa: E402
from AIML.study_material.quiz import QuizGenerator  # noqa: E402
from AIML.study_material.retriever import Retriever  # noqa: E402

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024

_engine = None
_retrievers = {}
_generator = LLMGenerator()


def engine():
    global _engine
    if _engine is None:
        _engine = CareerEngine()
    return _engine


def _save_upload(field="file"):
    f = request.files.get(field)
    if not f or not f.filename:
        return None, None
    suffix = Path(f.filename).suffix.lower()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    f.save(tmp.name)
    tmp.close()
    return tmp.name, f.filename


def _err(msg, code=400):
    return jsonify({"success": False, "error": msg}), code


@app.get("/health")
def health():
    eng = engine()
    return jsonify({
        "status": "ok",
        "embedding_backend": eng.career_recommender.matcher.backend,
        "llm": _generator.mode,
    })


@app.post("/analyze-resume")
def analyze_resume():
    path, name = _save_upload()
    if not path:
        return _err("Resume file is required (field: file).")
    try:
        text = ResumeParser(path).extract_text()
        if not text.strip():
            return _err("Could not extract text from this resume "
                        "(scanned image PDF?).", 422)

        eng = engine()
        jd_text = (request.form.get("jobDescription") or "").strip()
        result = eng.analyze(text)

        resume_skills = [s["name"] for s in result["skills"]]
        if jd_text:
            jd_skills = [s["name"] for s in eng.skill_normalizer.normalize(jd_text)]
            ats_source = "job_description"
        else:
            recs = result.get("career_recommendations") or []
            jd_skills = []
            if recs:
                best = recs[0]
                jd_skills = best["matched_skills"] + best["missing_skills"]
            ats_source = "top_career"
        ats = ATSScorer.calculate_score(resume_skills, jd_skills)
        ats["source"] = ats_source

        return jsonify({
            "success": True,
            "data": {
                "contact": {
                    "name": ResumeExtractor.extract_name(text),
                    "email": ResumeExtractor.extract_email(text),
                    "phone": ResumeExtractor.extract_phone(text),
                },
                "textLength": len(text),
                "domain": result["domain"],
                "skills": result["skills"],
                "status": result.get("status", "ok"),
                "message": result.get("message"),
                "ats": ats,
                "careerRecommendations": result.get("career_recommendations", []),
            },
        })
    except Exception as e:
        return _err(str(e), 500)
    finally:
        os.unlink(path)


@app.post("/interview/questions")
def interview_questions():
    body = request.get_json(silent=True) or {}
    resume_text = body.get("resumeText") or ""
    skills = body.get("skills") or []
    if not resume_text.strip():
        resume_text = " ".join(
            s if isinstance(s, str) else s.get("name", "") for s in skills
        ) or (body.get("role") or "")
    if not resume_text.strip():
        return _err("Provide resumeText, skills or role.")
    eng = engine()
    domain = body.get("domain") or eng.domain_detector.detect(resume_text)["domain"]
    questions = eng.interview_generator.generate(
        resume_text=resume_text,
        domain=domain,
        skills=skills,
        career=body.get("career") or body.get("role"),
        missing_skills=body.get("missingSkills") or [],
        limit=int(body.get("limit") or 10),
    )
    return jsonify({"success": True, "data": {"domain": domain, "questions": questions}})


def _material_text():
    path, name = _save_upload()
    if not path:
        return None, "Study material file is required (field: file)."
    try:
        return StudyMaterialExtractor.extract_text(path), None
    except Exception as e:
        return None, str(e)
    finally:
        os.unlink(path)


@app.post("/study/ask")
def study_ask():
    question = (request.form.get("question") or "").strip()
    if not question:
        return _err("question is required.")
    text, error = _material_text()
    if error:
        return _err(error)
    if not text.strip():
        return _err("No readable text found in the material.", 422)

    key = hashlib.sha1(text.encode("utf-8", "ignore")).hexdigest()
    if key not in _retrievers:
        chunks = TextChunker.chunk_text(text, chunk_size=500, overlap=50)
        _retrievers[key] = Retriever(chunks)
        if len(_retrievers) > 20:
            _retrievers.pop(next(iter(_retrievers)))
    results = _retrievers[key].retrieve(question, top_k=3)
    context = "\n\n".join(r["chunk"] for r in results)
    answer = _generator.generate(question, context)
    return jsonify({"success": True, "data": {
        "answer": answer, "mode": _generator.mode,
        "sources": [r["chunk"] for r in results],
    }})


@app.post("/study/flashcards")
def study_flashcards():
    text, error = _material_text()
    if error:
        return _err(error)
    limit = int(request.form.get("limit") or 10)
    return jsonify({"success": True,
                    "data": {"flashcards": FlashcardGenerator.generate(text, limit)}})


@app.post("/study/quiz")
def study_quiz():
    text, error = _material_text()
    if error:
        return _err(error)
    limit = int(request.form.get("limit") or 5)
    return jsonify({"success": True,
                    "data": {"questions": QuizGenerator.generate(text, limit)}})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("AI_PORT", "8000")))
