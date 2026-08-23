from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models import Cohort, Category, TechTag

app = create_app()

COHORTS = ["Cohort 301", "Cohort 12", "Cohort 11", "Cohort 10", "Cohort 9", "Cohort 8"]
CATEGORIES = ["Web Dev", "Mobile", "AI/ML", "Data", "Design"]
TECH_TAGS = [
    "React", "Flask", "PostgreSQL", "Kotlin", "Android", "Firebase", "TypeScript",
    "Figma", "Python", "Pandas", "Node.js", "Express", "MongoDB", "React Native",
    "TensorFlow", "JavaScript", "Framer Motion", "Canvas API",
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
    print(f"Seeded {Cohort.query.count()} cohorts, {Category.query.count()} categories, "
          f"{TechTag.query.count()} tech tags.")
