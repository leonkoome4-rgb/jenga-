from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Project, User, AIHistory
from app.utils.decorators import get_current_user_optional
from app.utils.rate_limit import check_rate_limit
from app.services.ai_service import call_ai, call_ai_messages, AIServiceError

bp = Blueprint("ai", __name__, url_prefix="/api/ai")

# AI Hub and the assistant don't require login, so there's no account to
# hold accountable for volume -- rate limit by IP instead. Every route here
# calls a paid API, so this is a real cost control, not a formality.
RATE_LIMIT_MAX_REQUESTS = 40
RATE_LIMIT_WINDOW_SECONDS = 600


@bp.before_request
def _enforce_rate_limit():
    key = request.remote_addr or "unknown"
    return check_rate_limit(key, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS)

# Destinations the chat assistant is allowed to send users to. Whatever the
# model returns for "navigate_to" is checked against this whitelist server
# side -- the model's opinion of a valid route is never trusted on its own.
ASSISTANT_ROUTES = {
    "/": "Landing page -- marketing home, with login / get started",
    "/discover": "The For You feed -- full-screen swipeable project videos",
    "/explore": "Explore -- search and filter projects by category or cohort",
    "/top": "Leaderboard -- top-liked projects",
    "/inbox": "Inbox -- connection requests and messages",
    "/ai-hub": "AI Hub -- categorize, describe, tag, skill-gap, team-match, README, debug tools",
    "/profile": "The signed-in user's own profile",
    "/add-project": "Form to publish a new project",
    "/login": "Log in page",
    "/register": "Create account page",
}


def _log(user_id, feature, input_data, output_data):
    if not user_id:
        return  # guest request -- nothing to attribute the history to
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

    _log(current_user.id if current_user else None, feature, input_data, output)
    return jsonify({"success": True, "result": output})


@bp.post("/project-categorize")
def project_categorize():
    current_user = get_current_user_optional()
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
    current_user = get_current_user_optional()
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
    current_user = get_current_user_optional()
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
    current_user = get_current_user_optional()
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
    current_user = get_current_user_optional()
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

    candidates_query = User.query
    if current_user:
        candidates_query = candidates_query.filter(User.id != current_user.id)
    candidates = candidates_query.limit(30).all()
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
    _log(current_user.id if current_user else None, "team-match", {"required_tech": required_tech}, result)
    return jsonify({"success": True, "result": result})


@bp.post("/readme")
def generate_readme():
    current_user = get_current_user_optional()
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
    current_user = get_current_user_optional()
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


@bp.post("/chat")
def chat():
    current_user = get_current_user_optional()
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"success": False, "error": "message is required"}), 400

    history = data.get("history") or []
    if not isinstance(history, list):
        history = []
    # Keep the prompt small -- only the last few turns are needed for context.
    history = [
        {"role": m.get("role"), "content": m.get("content")}
        for m in history[-8:]
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]

    routes_list = "\n".join(f"- {path} :: {desc}" for path, desc in ASSISTANT_ROUTES.items())
    system_prompt = (
        "You are the in-app assistant for Tawi (Moringa x Tawi), a project bank and creator "
        "network for Moringa School students. Be brief, warm, and helpful. You can hold a "
        "normal conversation about anything, and you can also move the user around the app "
        "when they ask to go somewhere.\n\n"
        "Pages you can send the user to (use the exact path):\n"
        f"{routes_list}\n\n"
        'Respond with a JSON object with exactly two keys: "reply" (a short plain-text answer '
        'or message to show the user) and "navigate_to" (one of the exact paths above if the '
        "user asked to go/see/open/take-me-to that page, otherwise null). Only set navigate_to "
        "when the user's message is actually a request to go somewhere -- not for general "
        "questions that merely mention a page."
    )

    if current_user:
        projects = sorted({m.project.name for m in current_user.project_memberships if m.project})
        system_prompt += (
            "\n\nThe user is logged in. Their account:\n"
            f"- Name: {current_user.name}\n"
            f"- Role: {current_user.role}\n"
            f"- Cohort: {current_user.cohort.name if current_user.cohort else 'not set'}\n"
            f"- Bio: {current_user.bio or 'not set'}\n"
            f"- GitHub: {current_user.github_url or 'not set'}\n"
            f"- Projects: {', '.join(projects) or 'none published yet'}\n"
            "Use this to personalize answers when relevant (e.g. questions about 'my "
            "projects' or 'my profile'). Don't recite it unprompted."
        )
    else:
        system_prompt += (
            "\n\nThe visitor is browsing without an account. If they ask about their own "
            "account, projects, or profile, gently mention that logging in unlocks that -- "
            "but don't block or refuse to help with anything else."
        )

    messages = [{"role": "system", "content": system_prompt}, *history, {"role": "user", "content": message}]

    try:
        output = call_ai_messages(messages)
    except AIServiceError as exc:
        return jsonify({"success": False, "error": str(exc)}), 502

    navigate_to = output.get("navigate_to")
    if navigate_to not in ASSISTANT_ROUTES:
        navigate_to = None

    reply = output.get("reply") or "..."
    return jsonify({"success": True, "result": {"reply": reply, "navigate_to": navigate_to}})
