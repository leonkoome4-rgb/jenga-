from flask import Flask, jsonify
from app.extensions import db, migrate, jwt, cors


def create_app(config_object="app.config.Config"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    if not app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise RuntimeError("DATABASE_URL is not set")
    if not app.config.get("JWT_SECRET_KEY"):
        raise RuntimeError("JWT_SECRET_KEY is not set")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes import (
        auth,
        users,
        projects,
        cohorts,
        reference,
        connections,
        ai,
        admin,
    )

    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(projects.bp)
    app.register_blueprint(cohorts.bp)
    app.register_blueprint(reference.bp)
    app.register_blueprint(connections.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(admin.bp)

    @jwt.unauthorized_loader
    def unauthorized(reason):
        return jsonify({"success": False, "error": "Missing or invalid token"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"success": False, "error": "Invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify({"success": False, "error": "Token has expired"}), 401

    @app.errorhandler(404)
    def not_found(err):
        return jsonify({"success": False, "error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(err):
        return jsonify({"success": False, "error": "Internal server error"}), 500

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "status": "ok"})

    return app
