from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class Cohort(db.Model):
    __tablename__ = "cohorts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)

    users = db.relationship("User", back_populates="cohort")
    projects = db.relationship("Project", back_populates="cohort")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "project_count": len(self.projects),
            "student_count": len(self.users),
        }


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    cohort_id = db.Column(db.Integer, db.ForeignKey("cohorts.id"), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    github_url = db.Column(db.String(255), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    cohort = db.relationship("Cohort", back_populates="users")
    project_memberships = db.relationship(
        "ProjectMember", back_populates="user", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_email=False):
        data = {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "cohort_id": self.cohort_id,
            "cohort_name": self.cohort.name if self.cohort else None,
            "bio": self.bio,
            "github_url": self.github_url,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat(),
        }
        if include_email:
            data["email"] = self.email
        return data


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)

    projects = db.relationship("Project", back_populates="category")

    def to_dict(self):
        return {"id": self.id, "name": self.name}


class TechTag(db.Model):
    __tablename__ = "tech_tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False, unique=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}


project_tech_tags = db.Table(
    "project_tech_tags",
    db.Column("id", db.Integer, primary_key=True),
    db.Column("project_id", db.Integer, db.ForeignKey("projects.id"), nullable=False),
    db.Column("tech_tag_id", db.Integer, db.ForeignKey("tech_tags.id"), nullable=False),
    db.UniqueConstraint("project_id", "tech_tag_id", name="uq_project_tech_tag"),
)


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    video_url = db.Column(db.String(500), nullable=True)
    github_link = db.Column(db.String(500), nullable=True)
    live_link = db.Column(db.String(500), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey("cohorts.id"), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    category = db.relationship("Category", back_populates="projects")
    cohort = db.relationship("Cohort", back_populates="projects")
    members = db.relationship(
        "ProjectMember", back_populates="project", cascade="all, delete-orphan"
    )
    tech_tags = db.relationship("TechTag", secondary=project_tech_tags)

    @property
    def owner_membership(self):
        return next((m for m in self.members if m.role_in_project == "owner"), None)

    @property
    def owner_id(self):
        membership = self.owner_membership
        return membership.user_id if membership else None

    def to_dict(self, detailed=False):
        owner = self.owner_membership
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "image_url": self.image_url,
            "video_url": self.video_url,
            "github_link": self.github_link,
            "live_link": self.live_link,
            "category": self.category.to_dict() if self.category else None,
            "cohort": self.cohort.to_dict() if self.cohort else None,
            "tech_tags": [t.to_dict() for t in self.tech_tags],
            "owner": owner.user.to_dict() if owner else None,
            "members": [m.user.to_dict() for m in self.members],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if detailed:
            data["full_description"] = self.full_description
        return data


class ProjectMember(db.Model):
    __tablename__ = "project_members"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role_in_project = db.Column(db.String(20), nullable=False, default="contributor")

    project = db.relationship("Project", back_populates="members")
    user = db.relationship("User", back_populates="project_memberships")

    __table_args__ = (
        db.UniqueConstraint("project_id", "user_id", name="uq_project_member"),
    )


class Connection(db.Model):
    __tablename__ = "connections"

    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    requester = db.relationship("User", foreign_keys=[requester_id])
    recipient = db.relationship("User", foreign_keys=[recipient_id])

    def to_dict(self):
        return {
            "id": self.id,
            "requester": self.requester.to_dict(),
            "recipient": self.recipient.to_dict(),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }


class AIHistory(db.Model):
    __tablename__ = "ai_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    feature = db.Column(db.String(60), nullable=False)
    input = db.Column(db.JSON, nullable=False)
    output = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "feature": self.feature,
            "input": self.input,
            "output": self.output,
            "created_at": self.created_at.isoformat(),
        }


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token_hash = db.Column(db.String(64), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    used_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    user = db.relationship("User")

    @property
    def is_valid(self):
        expires_at = self.expires_at
        # SQLite does not preserve timezone information for DateTime columns,
        # whereas PostgreSQL does. Treat a database value without tzinfo as
        # UTC so reset-token validation behaves identically in both setups.
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return self.used_at is None and expires_at > utcnow()
