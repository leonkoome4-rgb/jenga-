from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models import Cohort, Category, TechTag, User, Project, ProjectMember, CodeClinicPost, CodeClinicComment

app = create_app()

COHORTS = ["Cohort 301", "Cohort 12", "Cohort 11", "Cohort 10", "Cohort 9", "Cohort 8", "Group 6"]
CATEGORIES = ["Web Dev", "Mobile", "AI/ML", "Data", "Design"]
TECH_TAGS = [
    "React", "Flask", "PostgreSQL", "Kotlin", "Android", "Firebase", "TypeScript",
    "Figma", "Python", "Pandas", "Node.js", "Express", "MongoDB", "React Native",
    "TensorFlow", "JavaScript", "Framer Motion", "Canvas API",
    "Prisma", "SQLite", "Chart.js", "Tailwind CSS", "Twilio", "Claude API",
    "Puppeteer", "Next.js", "Daraja API", "JWT",
]

# Known admin accounts for this cohort group. Shared password is intentional
# for this project's own instructor/group admins -- not a general pattern.
ADMIN_COHORT = "Group 6"
ADMIN_PASSWORD = "123456678910"
ADMINS = [
    ("Leon Koome", "leon.koome@student.moringaschool.com"),
    ("Jason Mwangi", "jason.mwangi@student.moringaschool.com"),
    ("Nabil Hassan", "nabil.hassan@student.moringaschool.com"),
    ("Densinela Chepngetich", "densinela.chepngetich@student.moringaschool.com"),
]

# Demo project owners + demo projects with real media, so the feed has
# something to actually show once it's reading from the real backend
# instead of frontend mock data. Password isn't meant to be used by anyone --
# these are content placeholders, not real student accounts.
DEMO_PASSWORD = "demo12345"
DEMO_USERS = [
    ("Amara Chen", "amara.chen@demo.moringaschool.com", "Cohort 12",
     "Full-stack developer who likes building tools that make other builders faster."),
    ("Diego Ramirez", "diego.ramirez@demo.moringaschool.com", "Cohort 12",
     "Mobile engineer focused on Android and Kotlin. Previously interned at a fintech startup."),
    ("Priya Nair", "priya.nair@demo.moringaschool.com", "Cohort 11",
     "Designer-developer hybrid. Cares a lot about the details most people skip over."),
    ("Jordan Lee", "jordan.lee@demo.moringaschool.com", "Cohort 11",
     "Backend-leaning engineer, currently deep in data pipelines and ML tooling."),
    ("Sofia Petrov", "sofia.petrov@demo.moringaschool.com", "Cohort 10",
     "Frontend engineer with a soft spot for accessibility and motion design."),
    ("Marcus Webb", "marcus.webb@demo.moringaschool.com", "Cohort 9",
     "Full-stack builder, three years into a career switch from finance."),
    ("Hana Kobayashi", "hana.kobayashi@demo.moringaschool.com", "Cohort 12",
     "Product-minded engineer. Likes shipping small, useful things quickly."),
    ("Elena Volkov", "elena.volkov@demo.moringaschool.com", "Cohort 10",
     "Data-curious developer exploring the intersection of ML and product design."),
]

DEMO_PROJECTS = [
    dict(
        name="Pathway", owner="Amara Chen", members=["Amara Chen", "Jordan Lee"],
        description="A visual roadmap builder that helps students plan their learning path term by term.",
        full_description="Pathway lets students map out their entire program as an interactive timeline, mixing required courses, electives, and personal projects. It surfaces prerequisite conflicts automatically and suggests a lighter or heavier course load based on how a term is trending.",
        image_url="https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg",
        video_url="https://cdn.pixabay.com/video/2024/06/06/215500_large.mp4",
        category="Web Dev", cohort="Cohort 12", tech=["React", "Flask", "PostgreSQL"],
    ),
    dict(
        name="Riftline", owner="Diego Ramirez", members=["Diego Ramirez"],
        description="A native Android app for splitting group expenses on trips without the group chat chaos.",
        full_description="Riftline tracks who paid for what across a trip and settles balances with the fewest possible transactions. It works offline and syncs once everyone is back on wifi.",
        image_url="https://cdn.pixabay.com/photo/2019/11/23/11/33/mobile-phone-4646854_640.jpg",
        video_url=None,
        category="Mobile", cohort="Cohort 12", tech=["Kotlin", "Android", "Firebase"],
    ),
    dict(
        name="Foundry", owner="Priya Nair", members=["Priya Nair", "Sofia Petrov"],
        description="A component library and theming tool for teams who want consistency without a design system team.",
        full_description="Foundry generates a small, opinionated component library from a handful of design tokens. Point it at a color, a type scale, and a spacing unit, and it produces a themed set of buttons, inputs, and cards ready to drop into a React project.",
        image_url="https://cdn.pixabay.com/photo/2016/11/19/22/52/coding-1841550_640.jpg",
        video_url="https://cdn.pixabay.com/video/2024/03/12/203986-923133871_medium.mp4",
        category="Web Dev", cohort="Cohort 11", tech=["React", "TypeScript", "Figma"],
    ),
    dict(
        name="Signalgrid", owner="Jordan Lee", members=["Jordan Lee"],
        description="A lightweight pipeline for cleaning and visualizing sensor data from student hardware projects.",
        full_description="Signalgrid ingests raw CSV exports from Arduino and Raspberry Pi projects, cleans obvious sensor noise, and renders a live dashboard.",
        image_url="https://cdn.pixabay.com/photo/2016/07/13/17/39/big-data-1515036_640.jpg",
        video_url=None,
        category="Data", cohort="Cohort 11", tech=["Python", "Flask", "Pandas"],
    ),
    dict(
        name="Loop", owner="Sofia Petrov", members=["Sofia Petrov"],
        description="A focus timer that adapts session length based on how long you actually stay in flow.",
        full_description="Loop starts as a standard Pomodoro timer but adjusts future session lengths based on your own focus history. All the tracking happens locally, nothing leaves the device.",
        image_url="https://cdn.pixabay.com/photo/2016/11/30/20/58/programming-1873854_640.png",
        video_url="https://cdn.pixabay.com/video/2023/06/23/168485-839220701_medium.mp4",
        category="Web Dev", cohort="Cohort 10", tech=["React", "Framer Motion"],
    ),
    dict(
        name="Ledgerline", owner="Marcus Webb", members=["Marcus Webb"],
        description="A budgeting app for freelancers that separates taxable income from take-home pay automatically.",
        full_description="Ledgerline reads in freelance income line by line and estimates what should be set aside for taxes based on a configurable rate, then shows a clear take-home number.",
        image_url="https://cdn.pixabay.com/photo/2016/11/23/14/45/coding-1853305_640.jpg",
        video_url=None,
        category="Web Dev", cohort="Cohort 9", tech=["JavaScript", "Express", "MongoDB"],
    ),
    dict(
        name="Nearby", owner="Hana Kobayashi", members=["Hana Kobayashi", "Diego Ramirez"],
        description="A campus events app that surfaces what is happening within walking distance, right now.",
        full_description="Nearby pulls together club events, study sessions, and informal meetups into a single feed filtered by walking distance and time.",
        image_url="https://cdn.pixabay.com/photo/2024/02/24/19/00/phone-8594571_640.jpg",
        video_url=None,
        category="Mobile", cohort="Cohort 12", tech=["React Native", "Firebase"],
    ),
    dict(
        name="Palette", owner="Elena Volkov", members=["Elena Volkov"],
        description="An accessibility checker that rewrites a color palette to pass contrast requirements automatically.",
        full_description="Palette takes an existing brand palette and generates the smallest possible adjustments needed to meet WCAG AA contrast, so a design stays recognizable while becoming usable.",
        image_url="https://cdn.pixabay.com/photo/2016/11/04/11/46/robot-1797548_640.png",
        video_url="https://cdn.pixabay.com/video/2023/07/24/173104-848555587_medium.mp4",
        category="AI/ML", cohort="Cohort 10", tech=["Python", "TensorFlow"],
    ),
    dict(
        name="Cadence", owner="Amara Chen", members=["Amara Chen", "Priya Nair"],
        description="A shared calendar for study groups that finds overlapping free time without the back-and-forth.",
        full_description="Cadence connects to everyone's existing calendar and highlights the windows where a whole study group is actually free, ranked by how consistent that slot has been week over week.",
        image_url="https://cdn.pixabay.com/photo/2016/11/19/15/32/laptop-1839876_640.jpg",
        video_url=None,
        category="Web Dev", cohort="Cohort 11", tech=["React", "Node.js", "PostgreSQL"],
    ),
    dict(
        name="Overlook", owner="Sofia Petrov", members=["Sofia Petrov", "Hana Kobayashi"],
        description="A minimal habit tracker that only shows you the one habit that needs attention today.",
        full_description="Overlook deliberately shows one habit at a time instead of a full dashboard, picked by how close it is to breaking a streak.",
        image_url="https://cdn.pixabay.com/photo/2015/12/04/14/05/code-1076536_640.jpg",
        video_url=None,
        category="Web Dev", cohort="Cohort 12", tech=["React", "TypeScript"],
    ),
]

# Leon Koome's real, shipped projects -- real descriptions, tech stacks, and
# preview clips (frontend/public/leon-projects/), not placeholder content.
LEON_PROJECTS = [
    dict(
        name="Workforce Status & Payroll Console", owner="Leon Koome", members=["Leon Koome"],
        description="Full-stack internal HR and payroll system for a transport company -- employee lifecycle, daily status tracking, AES-256 encrypted bank details, leave management, and a compliance-grade audit log.",
        full_description="Full-stack internal HR and payroll system for a transport company -- employee lifecycle, daily status tracking, AES-256 encrypted bank details, leave management, and a compliance-grade audit log.",
        image_url="/leon-projects/hris-preview.jpg",
        video_url="/leon-projects/hris-preview.mp4",
        live_link=None,
        category="Web Dev", cohort="Group 6",
        tech=["Node.js", "Express", "Prisma", "SQLite", "Chart.js", "Tailwind CSS"],
    ),
    dict(
        name="WhatsApp Creative Agency", owner="Leon Koome", members=["Leon Koome"],
        description="A WhatsApp bot that turns a text conversation into a finished job -- classifies each message, drafts a poster or freelancer quote via Claude, and routes approvals through Twilio.",
        full_description="A WhatsApp bot that turns a text conversation into a finished job. One webhook classifies each message as a simple poster request or a complex brief, drafts a Puppeteer-rendered poster or a freelancer quote via Claude, and routes approvals and freelancer notifications through Twilio -- all state lives in SQLite via Prisma. Currently runs against a local ngrok tunnel, not yet on a public server.",
        image_url="/leon-projects/whatsapp-agency-preview.jpg",
        video_url="/leon-projects/whatsapp-agency-preview.mp4",
        live_link=None,
        category="Web Dev", cohort="Group 6",
        tech=["Node.js", "Twilio", "Claude API", "Puppeteer", "Prisma", "SQLite"],
    ),
    dict(
        name="Super Metro -- Transport Website", owner="Leon Koome", members=["Leon Koome"],
        description="Full marketing and service site for Super Metro, a Nairobi bus SACCO with 500+ vehicles -- scroll-driven animations, live route maps, airport shuttle booking, and an incident-report flow.",
        full_description="Full marketing and service site for Super Metro, a Nairobi bus SACCO with 500+ vehicles. Includes scroll-driven animations, live route maps, airport shuttle booking, and an incident-report flow.",
        image_url="/leon-projects/super-metro-preview.jpg",
        video_url=None,
        live_link="https://super-metro-gb9k.vercel.app",
        category="Web Dev", cohort="Group 6",
        tech=["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    ),
    dict(
        name="Super Metro Insurance Agency", owner="Leon Koome", members=["Leon Koome"],
        description="Full-stack insurance agency site covering all 9 insurance classes with a 6-step motor quote wizard, real IRA-standard premium calculations, and M-Pesa Daraja STK Push payments.",
        full_description="Full-stack insurance agency site covering all 9 insurance classes with a 6-step motor quote wizard, real IRA-standard premium calculations, and Safaricom Daraja M-Pesa STK Push payments.",
        image_url="/leon-projects/super-metro-insurance-preview.jpg",
        video_url=None,
        live_link="https://insuarance-tau.vercel.app",
        category="Web Dev", cohort="Group 6",
        tech=["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Daraja API"],
    ),
    dict(
        name="Kikapu -- Group-Fund Platform for Chamas", owner="Leon Koome", members=["Leon Koome"],
        description="Full-stack platform for Kenyan chamas, emergency funds, weddings, and harambees -- six fund types on one flexible schema, M-Pesa contributions, and admin-approved member claims. Built with a 4-person team.",
        full_description="Full-stack platform for Kenyan chamas, emergency funds, weddings, matanga contributions, and harambees -- six fund types on one flexible schema, M-Pesa Daraja STK Push contributions, member claims with admin approval, and pluggable SMS/email notifications. Built with a 4-person team.",
        image_url="/leon-projects/kikapu-preview.jpg",
        video_url="/leon-projects/kikapu-preview.mp4",
        live_link="https://kikapu-kappa.vercel.app",
        category="Web Dev", cohort="Group 6",
        tech=["React", "Flask", "PostgreSQL", "JWT", "Daraja API", "Tailwind CSS"],
    ),
]
DEMO_PROJECTS += LEON_PROJECTS
REMOVED_PROJECT_NAMES = [
    "Report It -- Anonymous Misconduct Reporting",
    "RentTrack -- Payment-Collection Tracker",
]

# Real-life problems students actually hit, so /code-clinic has something worth
# browsing on day one instead of an empty feed.
CODE_CLINIC_POSTS = [
    dict(
        author="Diego Ramirez", resolved=True,
        question="My React app gets \"blocked by CORS policy\" when I call my Flask API from the "
                 "browser, but the exact same request works fine in Postman. What am I missing?",
        media_type="none", media_url=None,
        comments=[
            ("Amara Chen", "Postman doesn't enforce CORS at all -- it's a browser-only security "
                            "rule, so this is expected. Add flask-cors and set the allowed origin "
                            "to your actual frontend URL, not '*', if you're sending credentials."),
            ("Jordan Lee", "Also double check you're not accidentally calling http:// when your "
                            "frontend is on https://, or vice versa -- that counts as a different "
                            "origin too."),
        ],
    ),
    dict(
        author="Hana Kobayashi", resolved=False,
        question="console.log() right after calling setState still shows the OLD value. Is "
                 "React broken, or am I missing something obvious?",
        media_type="none", media_url=None,
        comments=[
            ("Sofia Petrov", "Not broken -- state updates are asynchronous and batched. Your "
                              "log runs before the re-render happens. Move the log into a "
                              "useEffect that watches that piece of state instead."),
        ],
    ),
    dict(
        author="Marcus Webb", resolved=True,
        question="npm install fails with ERESOLVE and a wall of peer dependency errors. Worked "
                 "fine on my last project with the same packages.",
        media_type="none", media_url=None,
        comments=[
            ("Priya Nair", "Usually means two packages want incompatible versions of the same "
                            "dependency. `npm install --legacy-peer-deps` gets you unblocked, but "
                            "it's worth checking package.json for a version mismatch first."),
            ("Elena Volkov", "If it keeps happening across projects, might be worth switching to "
                              "pnpm -- its resolution errors are usually a lot more readable."),
        ],
    ),
    dict(
        author="Elena Volkov", resolved=False,
        question="My Flask API returns a plain 500 with zero detail once it's deployed, but "
                 "works perfectly on localhost. How do I even find out what's failing?",
        media_type="none", media_url=None,
        comments=[
            ("Jordan Lee", "FLASK_DEBUG=True locally would've shown you the traceback -- try "
                            "reproducing it that way first. In production, check your host's log "
                            "output (Render/Railway both stream logs) instead of the response body."),
            ("Amara Chen", "Also a classic cause: an env var that's set locally but not on the "
                            "deployed host, so something like the DB URL or API key comes back "
                            "None and blows up downstream."),
        ],
    ),
    dict(
        author="Priya Nair", resolved=False,
        question="Flexbox items center perfectly on desktop but stack weirdly and overflow on "
                 "mobile. Screenshot attached.",
        media_type="image",
        media_url="https://cdn.pixabay.com/photo/2017/08/10/08/47/laptop-2620118_640.jpg",
        comments=[
            ("Sofia Petrov", "Looks like a min-width issue -- a flex child without min-width: 0 "
                              "won't shrink below its content size, so it forces the row to "
                              "overflow instead of wrapping."),
        ],
    ),
    dict(
        author="Amara Chen", resolved=True,
        question="Users stay 'logged in' in the UI even after their JWT expires -- API calls "
                 "start failing with 401 but nothing redirects them to login.",
        media_type="none", media_url=None,
        comments=[
            ("Diego Ramirez", "You need a global check: catch 401s in your fetch wrapper and "
                               "clear the stored token + redirect there, rather than handling it "
                               "per-component."),
            ("Hana Kobayashi", "This bit us too -- also worth NOT wiping the session on every "
                                "failure, only on a real 401, otherwise a flaky connection logs "
                                "people out for no reason."),
        ],
    ),
    dict(
        author="Sofia Petrov", resolved=False,
        question="ModuleNotFoundError even though I definitely ran pip install inside my venv. "
                 "Losing my mind a little.",
        media_type="none", media_url=None,
        comments=[
            ("Marcus Webb", "Run `which python` and `which pip` -- if they don't both point "
                             "inside your venv folder, you installed into a different Python than "
                             "the one running your script."),
        ],
    ),
    dict(
        author="Jordan Lee", resolved=False,
        question="Git keeps giving me merge conflicts every time I push, and I don't understand "
                 "what the <<<<<<<, =======, >>>>>>> markers actually mean.",
        media_type="video",
        media_url="https://cdn.pixabay.com/video/2020/02/12/32046-390511322_medium.mp4",
        comments=[
            ("Elena Volkov", "Everything between <<<<<<< HEAD and ======= is your version; "
                              "everything between ======= and >>>>>>> is theirs. Delete the "
                              "markers and keep/merge the lines you actually want, then commit."),
            ("Priya Nair", "`git pull` before you start working each day cuts down on how often "
                            "this happens in the first place."),
        ],
    ),
]

with app.app_context():
    for name in COHORTS:
        if not Cohort.query.filter_by(name=name).first():
            db.session.add(Cohort(name=name))

    for name in CATEGORIES:
        if not Category.query.filter_by(name=name).first():
            db.session.add(Category(name=name))

    for name in TECH_TAGS:
        if not TechTag.query.filter_by(name=name).first():
            db.session.add(TechTag(name=name))

    db.session.commit()

    group6 = Cohort.query.filter_by(name=ADMIN_COHORT).first()
    admins_created = 0
    for name, email in ADMINS:
        if User.query.filter_by(email=email).first():
            continue
        user = User(name=name, email=email, role="admin", cohort_id=group6.id if group6 else None)
        user.set_password(ADMIN_PASSWORD)
        db.session.add(user)
        admins_created += 1

    users_created = 0
    for name, email, cohort_name, bio in DEMO_USERS:
        if User.query.filter_by(email=email).first():
            continue
        cohort = Cohort.query.filter_by(name=cohort_name).first()
        user = User(name=name, email=email, role="student", cohort_id=cohort.id if cohort else None, bio=bio)
        user.set_password(DEMO_PASSWORD)
        db.session.add(user)
        users_created += 1
    db.session.commit()

    projects_created = 0
    projects_updated = 0
    for p in DEMO_PROJECTS:
        existing = Project.query.filter_by(name=p["name"]).first()
        if existing:
            # Leon's projects are real, curated content that gets refined
            # over time (e.g. adding a preview image after the fact) -- keep
            # them in sync on every seed run instead of only-ever-create.
            if p in LEON_PROJECTS:
                changed = False
                for field in ("description", "full_description", "image_url", "video_url", "live_link"):
                    if getattr(existing, field) != p.get(field):
                        setattr(existing, field, p.get(field))
                        changed = True
                if changed:
                    projects_updated += 1
            continue

        category = Category.query.filter_by(name=p["category"]).first()
        cohort = Cohort.query.filter_by(name=p["cohort"]).first()
        tech_tags = [TechTag.query.filter_by(name=t).first() for t in p["tech"]]

        project = Project(
            name=p["name"],
            description=p["description"],
            full_description=p["full_description"],
            image_url=p["image_url"],
            video_url=p["video_url"],
            github_link=p.get("github_link"),
            live_link=p.get("live_link"),
            category_id=category.id if category else None,
            cohort_id=cohort.id if cohort else None,
        )
        project.tech_tags = [t for t in tech_tags if t]
        db.session.add(project)
        db.session.flush()

        owner = User.query.filter_by(name=p["owner"]).first()
        for member_name in p["members"]:
            member = User.query.filter_by(name=member_name).first()
            if not member:
                continue
            db.session.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=member.id,
                    role_in_project="owner" if member_name == p["owner"] else "contributor",
                )
            )
        projects_created += 1

    db.session.commit()

    projects_removed = 0
    for name in REMOVED_PROJECT_NAMES:
        project = Project.query.filter_by(name=name).first()
        if project:
            db.session.delete(project)
            projects_removed += 1
    db.session.commit()

    code_clinic_posts_created = 0
    if CodeClinicPost.query.count() == 0:
        for p in CODE_CLINIC_POSTS:
            author = User.query.filter_by(name=p["author"]).first()
            if not author:
                continue

            post = CodeClinicPost(
                user_id=author.id,
                question=p["question"],
                media_type=p["media_type"],
                media_url=p["media_url"],
                resolved=p["resolved"],
            )
            db.session.add(post)
            db.session.flush()

            for commenter_name, body in p["comments"]:
                commenter = User.query.filter_by(name=commenter_name).first()
                if not commenter:
                    continue
                db.session.add(CodeClinicComment(code_clinic_post_id=post.id, user_id=commenter.id, body=body))

            code_clinic_posts_created += 1

    db.session.commit()
    print(f"Seeded {Cohort.query.count()} cohorts, {Category.query.count()} categories, "
          f"{TechTag.query.count()} tech tags, {admins_created} new admin account(s), "
          f"{users_created} new demo user(s), {projects_created} new demo project(s) "
          f"({projects_updated} updated, {projects_removed} removed), "
          f"{code_clinic_posts_created} new Code Clinic post(s).")
