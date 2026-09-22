"""
SRC – Preverjanje varnosti gesel (Flask)
=========================================
Nadgrajena različica.

KLJUČNA VARNOSTNA IZBOLJŠAVA:
  V prvotni aplikaciji se je geslo poslalo na strežnik prek POST.
  Tukaj se VSA analiza izvede v brskalniku (static/script.js).
  Strežnik streže le statične strani in geslo nikoli ne zapusti naprave.

Zagon:
    pip install flask
    python app.py
    -> http://127.0.0.1:5000
"""
from flask import Flask, render_template, Response

app = Flask(__name__)


@app.after_request
def security_headers(resp: Response) -> Response:
    # Osnovni varnostni glave (dobra praksa za javno aplikacijo)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "form-action 'none'"
    )
    return resp


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/o-projektu")
def about():
    return render_template("about.html")


if __name__ == "__main__":
    app.run(debug=False)
