import time
from collections import defaultdict
from threading import Lock

from flask import jsonify, request

_hits = defaultdict(list)
_lock = Lock()


def check_rate_limit(key, max_requests, window_seconds):
    """Simple in-memory per-key sliding-window limiter. Returns None if the
    request is allowed, or a (response, status) pair if it should be
    blocked. Used for routes with no login requirement, so there's no
    account to hold accountable for volume."""
    now = time.monotonic()
    with _lock:
        hits = [t for t in _hits[key] if now - t < window_seconds]
        if len(hits) >= max_requests:
            retry_after = int(window_seconds - (now - hits[0])) + 1
            response = jsonify(
                {
                    "success": False,
                    "error": "Too many requests -- please wait a moment and try again.",
                }
            )
            response.status_code = 429
            response.headers["Retry-After"] = str(retry_after)
            return response
        hits.append(now)
        _hits[key] = hits
    return None
