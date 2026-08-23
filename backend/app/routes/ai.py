from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Project, User, AIHistory
from app.utils.decorators import get_current_user
from app.services.ai_service import call_ai, AIServiceError

bp = Blueprint("ai", __name__, url_prefix="/api/ai")


def _log(user_id, feature, input_data, output_data):
    db.session.add(
        AIHistory(user_id=user_id, feature=feature, input=input_data, output=output_data)
    )
    db.session.commit()


def _require_keys(data, keys):
    missing = [k for k in keys if not data.get(k)]
    if missing:
        return f"Missing required field(s): {', '.join(missing)}"
    return None


def _run(feature, system_prompt, user_prompt, input_data, current_user):
    try:
        output = call_ai(system_prompt, user_prompt)
    except AIServiceError as exc:
        return jsonify({"success": False, "error": str(exc)}), 502

    _log(current_user.id, feature, input_data, output)
    return jsonify({"success": True, "result": output})


@bp.post("/project-categorize")
def project_categorize():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    error = _require_keys(data, ["title", "description"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    system_prompt = (
        "You categorize student software projects. Given a title, description, and tech "
        "stack, respond with a JSON object with exactly these keys: "
        '"category" (one short string like "Web Dev", "Mobile", "AI/ML", "Data", "Design"), '
        '"difficulty" (one of "Beginner", "Intermediate", "Advanced"), '
        '"tags" (an array of 3-6 short lowercase keyword strings), '
        '"reasoning" (one or two sentences explaining the categorization).'
    )
    user_prompt = (
        f"Title: {data['title']}\n"
        f"Description: {data['description']}\n"
        f"Tech stack: {', '.join(data.get('tech', []))}"
    )
    return _run("project-categorize", system_prompt, user_prompt, data, current_user)


@bp.post("/project-description")
def project_description():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    error = _require_keys(data, ["name"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    system_prompt = (
        "You write polished, specific project descriptions for a student project bank. "
        "Given a project name, tech stack, key features, and target audience, respond with "
        'a JSON object with exactly these keys: "short_description" (one sentence, under 160 '
        'characters) and "full_description" (2-3 short paragraphs, plain text, no markdown).'
    )
    user_prompt = (
        f"Name: {data['name']}\n"
        f"Tech stack: {', '.join(data.get('tech', []))}\n"
        f"Key features: {data.get('features', 'not specified')}\n"
        f"Target audience: {data.get('audience', 'not specified')}"
    )
    return _run("project-description", system_prompt, user_prompt, data, current_user)


@bp.post("/tags")
def generate_tags():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    error = _require_keys(data, ["title", "description"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    system_prompt = (
        "You generate searchable tags for a student software project. Given a title, "
        "description, and tech stack, respond with a JSON object with exactly one key: "
        '"tags", an array of 5-8 short lowercase keyword strings (technologies, domain, '
        "and use-case terms) that a user might search for."
    )
    user_prompt = (
        f"Title: {data['title']}\n"
        f"Description: {data['description']}\n"
        f"Tech stack: {', '.join(data.get('tech', []))}"
    )
    return _run("tags", system_prompt, user_prompt, data, current_user)


@bp.post("/skill-gap")
def skill_gap():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}

    required_tech = data.get("required_tech")
    project_id = data.get("project_id")
    if not required_tech and project_id:
        project = db.session.get(Project, project_id)
        if not project:
            return jsonify({"success": False, "error": "Invalid project_id"}), 400
        required_tech = [t.name for t in project.tech_tags]

    error = _require_keys({"required_tech": required_tech}, ["required_tech"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    skills = data.get("skills", [])

    system_prompt = (
        "You do a skill-gap analysis for a student against a project's required tech stack. "
        "Given the student's current skills and the project's required tech, respond with a "
        'JSON object with exactly these keys: "missing_skills" (an array of objects, each '
        'with "skill", "priority" one of "high"/"medium"/"low", and "learning_order" an '
        'integer starting at 1), and "summary" (one or two encouraging sentences).'
    )
    user_prompt = (
        f"Student's current skills: {', '.join(skills) or 'none listed'}\n"
        f"Project's required tech: {', '.join(required_tech)}"
    )
    return _run(
        "skill-gap", system_prompt, user_prompt, {"skills": skills, "required_tech": required_tech}, current_user
    )


@bp.post("/team-match")
def team_match():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}

    required_tech = data.get("required_tech")
    project_id = data.get("project_id")
    if not required_tech and project_id:
        project = db.session.get(Project, project_id)
        if not project:
            return jsonify({"success": False, "error": "Invalid project_id"}), 400
        required_tech = [t.name for t in project.tech_tags]

    error = _require_keys({"required_tech": required_tech}, ["required_tech"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    candidates = User.query.filter(User.id != current_user.id).limit(30).all()
    if not candidates:
        return jsonify({"success": True, "result": {"matches": []}})

    candidate_lines = []
    for candidate in candidates:
        skills = sorted(
            {tag.name for m in candidate.project_memberships for tag in m.project.tech_tags}
        )
        candidate_lines.append(
            f"- id={candidate.id}, name={candidate.name}, "
            f"bio={candidate.bio or 'n/a'}, skills={', '.join(skills) or 'none listed'}"
        )

    system_prompt = (
        "You match students to a project team based on required tech and each candidate's "
        "demonstrated skills. Respond with a JSON object with exactly one key: \"matches\", "
        "an array of up to 5 objects, each with \"user_id\" (integer, must be one of the "
        'given candidate ids), "score" (integer 0-100), and "reasons" (an array of 1-3 short '
        "strings). Order matches by score, highest first."
    )
    user_prompt = (
        f"Project's required tech: {', '.join(required_tech)}\n\nCandidates:\n"
        + "\n".join(candidate_lines)
    )

    try:
        output = call_ai(system_prompt, user_prompt)
    except AIServiceError as exc:
        return jsonify({"success": False, "error": str(exc)}), 502

    candidate_by_id = {c.id: c for c in candidates}
    matches = []
    for match in output.get("matches", []):
        candidate = candidate_by_id.get(match.get("user_id"))
        if candidate:
            matches.append(
                {
                    "user": candidate.to_dict(),
                    "score": match.get("score"),
                    "reasons": match.get("reasons", []),
                }
            )

    result = {"matches": matches}
    _log(current_user.id, "team-match", {"required_tech": required_tech}, result)
    return jsonify({"success": True, "result": result})


@bp.post("/readme")
def generate_readme():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}

    project_id = data.get("project_id")
    if project_id and not data.get("name"):
        project = db.session.get(Project, project_id)
        if not project:
            return jsonify({"success": False, "error": "Invalid project_id"}), 400
        data = {
            "name": project.name,
            "description": project.description,
            "tech": [t.name for t in project.tech_tags],
            "github_link": project.github_link,
            "live_link": project.live_link,
        }

    error = _require_keys(data, ["name", "description"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    system_prompt = (
        "You write a complete, well-formatted README.md for a student software project. "
        "Respond with a JSON object with exactly one key: \"readme_markdown\", a single "
        "string containing the full README in markdown (title, description, tech stack, "
        "setup/install steps, usage, and links sections as applicable)."
    )
    user_prompt = (
        f"Name: {data['name']}\n"
        f"Description: {data['description']}\n"
        f"Tech stack: {', '.join(data.get('tech', []))}\n"
        f"GitHub link: {data.get('github_link', 'not provided')}\n"
        f"Live link: {data.get('live_link', 'not provided')}"
    )
    return _run("readme", system_prompt, user_prompt, data, current_user)


@bp.post("/debug")
def debug_assistant():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    error = _require_keys(data, ["language", "code", "error_message"])
    if error:
        return jsonify({"success": False, "error": error}), 400

    system_prompt = (
        "You are a debugging assistant. Given a programming language, a code snippet, and "
        "an error message, respond with a JSON object with exactly these keys: \"cause\" "
        '(one or two sentences explaining the root cause), "fix" (one or two sentences '
        'explaining the fix), and "corrected_code" (the full corrected code as a string).'
    )
    user_prompt = (
        f"Language: {data['language']}\n"
        f"Error message: {data['error_message']}\n"
        f"Code:\n{data['code']}"
    )
    return _run("debug", system_prompt, user_prompt, data, current_user)
