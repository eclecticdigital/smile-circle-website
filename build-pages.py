#!/usr/bin/env python3
"""Build the GitHub Pages copy in docs/ with root-absolute paths prefixed by the repo name."""
import os, re, shutil
PREFIX = "/smile-circle-website"
SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SRC, "docs")
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(os.path.join(OUT, "contact-us"))
shutil.copytree(os.path.join(SRC, "assets"), os.path.join(OUT, "assets"))
def rewrite(html):
    # href="/..." / src="/..." (root-absolute, not protocol-relative) -> prefixed
    html = re.sub(r'((?:href|src)=")/(?!/)', r'\1' + PREFIX + '/', html)
    # preview copy must not be indexed; production canonical stays pointed at the real domain
    html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1">',
                        '<meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="robots" content="noindex, nofollow">', 1)
    return html
for rel in ["index.html", "contact-us/index.html"]:
    with open(os.path.join(SRC, rel)) as f: html = f.read()
    with open(os.path.join(OUT, rel), "w") as f: f.write(rewrite(html))
open(os.path.join(OUT, ".nojekyll"), "w").close()
with open(os.path.join(OUT, "404.html"), "w") as f:
    f.write(f"""<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Not in this preview | Smile Circle</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="{PREFIX}/assets/css/site.css"></head>
<body><main class="container" style="padding:160px 0 120px;text-align:center;max-width:640px"><span class="eyebrow">Preview</span><h1 style="margin:1rem 0;font-size:2.4rem">This page isn't part of the preview yet</h1><p class="lead">Only the home page and contact page have been built so far. The other URLs from the current site will be added in the full build.</p>
<p style="margin-top:2rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap"><a class="btn btn--primary" href="{PREFIX}/">Home page</a><a class="btn btn--ghost" href="{PREFIX}/contact-us/">Contact page</a></p></main></body></html>""")
print("built docs/ with prefix", PREFIX)
