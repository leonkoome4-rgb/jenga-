#!/bin/sh
set -eu

# Apply the versioned database schema before accepting requests. This is safe
# to run on every container start: Alembic skips migrations already applied.
flask --app run:app db upgrade

exec gunicorn \
  --bind "0.0.0.0:${PORT:-5000}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout 120 \
  run:app
