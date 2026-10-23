"""Run from repo root:  python -m AIML.tests.test_service"""
import io
from pathlib import Path

from AIML.service.app import app

DATA = Path(__file__).resolve().parents[1] / "data"
client = app.test_client()
MATERIAL = (
    b"Python is a programming language used for software development. "
    b"Docker is a containerization platform used to package applications. "
    b"FastAPI is a Python framework for building REST APIs quickly. "
    b"AWS provides cloud computing services such as EC2 and S3 for hosting."
)


def post_file(url, content, name, **fields):
    return client.post(url, data={"file": (io.BytesIO(content), name), **fields},
                       content_type="multipart/form-data")


def test_all():
    assert client.get("/health").get_json()["status"] == "ok"

    pdf = (DATA / "sample_resume.pdf").read_bytes()
    jd = (DATA / "job_description.txt").read_text()
    r = post_file("/analyze-resume", pdf, "resume.pdf", jobDescription=jd).get_json()
    assert r["success"] and r["data"]["ats"]["source"] == "job_description"
    assert r["data"]["careerRecommendations"], "no career recommendations"

    assert post_file("/analyze-resume", b"", "empty.pdf").status_code in (400, 422)
    assert client.post("/analyze-resume").status_code == 400

    q = client.post("/interview/questions", json={"role": "Backend Developer",
                                                   "skills": ["Python"]}).get_json()
    assert len(q["data"]["questions"]) > 0

    a = post_file("/study/ask", MATERIAL, "m.txt", question="What is Docker?").get_json()
    assert "container" in a["data"]["answer"].lower()
    assert post_file("/study/flashcards", MATERIAL, "m.txt").get_json()["data"]["flashcards"]
    assert post_file("/study/quiz", MATERIAL, "m.txt").get_json()["data"]["questions"]
    print("ALL AI SERVICE TESTS PASSED")


if __name__ == "__main__":
    test_all()
