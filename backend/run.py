import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app  # noqa: E402  (must come after load_dotenv)

app = create_app()

if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    app.run(debug=debug, port=int(os.environ.get("PORT", 5000)))
