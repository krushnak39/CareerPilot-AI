"""
CareerPilot AI - AIML HTTP service.

Run from the repository root so the `AIML` package is importable:

    gunicorn AIML.api:app --bind 0.0.0.0:8000 --timeout 180

Endpoints
    GET  /health
    POST /analyze   multipart/form-data
                    resume: PDF file (required)
                    job_description: text (optional)
"""

import os
import tempfile
import threading

from flask import Flask, jsonify, request

from AIML.ats.scorer import ATSScorer
from AIML.analysis.recommendation import SkillRecommendation
from AIML.career_engine import CareerEngine
from AIML.parser.extractor import ResumeExtractor
from AIML.parser.resume_parser import ResumeParser
from AIML.skill_normalizer import SkillNormalizer
from AIML import study_lite

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024  # 6 MB

SERVICE_KEY = os.getenv("AIML_SERVICE_KEY", "").strip()

_engine = None
_normalizer = None
_lock = threading.Lock()


def get_engine():
    """Create the (heavy) CareerEngine once, on first use."""
    global _engine
    if _engine is None:
        with _lock:
            if _engine is None:
                _engine = CareerEngine()
    return _engine


def get_normalizer():
    global _normalizer
    if _normalizer is None:
        _normalizer = SkillNormalizer()
    return _normalizer


def _safe_name(value):
    """Return the first resume line only when it plausibly is a name."""
    if value and len(value) <= 40 and "@" not in value and "|" not in value:
        return value
    return None


@app.before_request
def check_key():
    if request.path == "/health" or not SERVICE_KEY:
        return None
    if request.headers.get("X-AIML-KEY", "") != SERVICE_KEY:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    return None


@app.get("/health")
def health():
    return jsonify({"success": True, "service": "careerpilot-aiml"})


def build_ats(resume_text, job_description):
    normalizer = get_normalizer()
    resume_skills = [s["name"] for s in normalizer.normalize(resume_text)]
    jd_skills = [s["name"] for s in normalizer.normalize(job_description)]

    if not jd_skills:
        return {
            "score": 0,
            "matched": [],
            "missing": [],
            "recommendations": {},
            "message": "No recognizable skills were found in the job description.",
        }

    result = ATSScorer.calculate_score(resume_skills, jd_skills)
    return {
        "score": result["score"],
        "matched": sorted(result["matched"]),
        "missing": sorted(result["missing"]),
        "recommendations": SkillRecommendation.recommend(result["missing"]),
    }


@app.post("/analyze")
def analyze():
    upload = request.files.get("resume")
    if upload is None or not upload.filename:
        return jsonify({"success": False, "message": "resume PDF is required"}), 400

    job_description = (request.form.get("job_description") or "").strip()

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            upload.save(tmp)
            tmp_path = tmp.name

        resume_text = ResumeParser(tmp_path).extract_text()
        # Collapse repeated spaces left behind by some PDF extractors so
        # phone/name patterns match reliably.
        resume_text = "\n".join(" ".join(line.split()) for line in resume_text.splitlines())
        if not resume_text.strip():
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Could not extract text from this PDF. "
                        "It may be a scanned image.",
                    }
                ),
                422,
            )

        analysis = get_engine().analyze(resume_text)

        payload = {
            "contact": {
                "name": _safe_name(ResumeExtractor.extract_name(resume_text)),
                "email": ResumeExtractor.extract_email(resume_text),
                "phone": ResumeExtractor.extract_phone(resume_text),
            },
            "domain": analysis.get("domain"),
            "skills": analysis.get("skills", []),
            "career_recommendations": analysis.get("career_recommendations", []),
            "status": analysis.get("status", "ok"),
            "message": analysis.get("message"),
            "ats": build_ats(resume_text, job_description)
            if job_description
            else None,
        }
        return jsonify({"success": True, "data": payload})
    except Exception as error:  # noqa: BLE001
        app.logger.exception("Analysis failed")
        return jsonify({"success": False, "message": f"Analysis failed: {error}"}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/study")
def study():
    """Study-material assistant: ask / summary / flashcards / quiz."""
    upload = request.files.get("file")
    if upload is None or not upload.filename:
        return jsonify({"success": False, "message": "file is required"}), 400

    action = (request.form.get("action") or "").strip().lower()
    if action not in ("ask", "summary", "flashcards", "quiz"):
        return jsonify({"success": False, "message": "Invalid action"}), 400

    question = (request.form.get("question") or "").strip()
    if action == "ask" and not question:
        return jsonify({"success": False, "message": "question is required"}), 400

    suffix = os.path.splitext(upload.filename)[1].lower() or ".txt"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            upload.save(tmp)
            tmp_path = tmp.name

        result = study_lite.run(tmp_path, action, question)
        return jsonify({"success": True, "data": result})
    except ValueError as error:
        return jsonify({"success": False, "message": str(error)}), 422
    except Exception as error:  # noqa: BLE001
        app.logger.exception("Study action failed")
        return jsonify({"success": False, "message": f"Study action failed: {error}"}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
