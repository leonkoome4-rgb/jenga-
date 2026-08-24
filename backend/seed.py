from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models import Cohort, Category, TechTag, User

app = create_app()

COHORTS = ["Cohort 301", "Cohort 12", "Cohort 11", "Cohort 10", "Cohort 9", "Cohort 8", "Group 6"]
CATEGORIES = ["Web Dev", "Mobile", "AI/ML", "Data", "Design"]
TECH_TAGS = [
    "React", "Flask", "PostgreSQL", "Kotlin", "Android", "Firebase", "TypeScript",
    "Figma", "Python", "Pandas", "Node.js", "Express", "MongoDB", "React Native",
    "TensorFlow", "JavaScript", "Framer Motion", "Canvas API",
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

    db.session.commit()
    print(f"Seeded {Cohort.query.count()} cohorts, {Category.query.count()} categories, "
          f"{TechTag.query.count()} tech tags, {admins_created} new admin account(s).")
