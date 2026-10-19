"""Build the portfolio's selectable-text, single-column resume.

Sources and editorial boundaries are recorded in data/profile-sources.md.
Requires reportlab. This is a manual content build, not a GitHub snapshot sync.
"""
from pathlib import Path
import sys
import os
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

font_dir = Path(os.environ.get('RESUME_FONT_DIR', '/usr/share/fonts/truetype/dejavu'))
pdfmetrics.registerFont(TTFont('ResumeSans', str(font_dir / 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('ResumeSans-Bold', str(font_dir / 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('ResumeSans', normal='ResumeSans', bold='ResumeSans-Bold', italic='ResumeSans', boldItalic='ResumeSans-Bold')

destination = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'assets' / 'Om_Singh_Jadon_Resume.pdf'
destination.parent.mkdir(parents=True, exist_ok=True)
ink = colors.HexColor('#18202b')
styles = {
    'name': ParagraphStyle('name', fontName='ResumeSans-Bold', fontSize=19, leading=22, alignment=TA_CENTER, textColor=ink),
    'contact': ParagraphStyle('contact', fontName='ResumeSans', fontSize=8.6, leading=12, alignment=TA_CENTER, textColor=ink),
    'section': ParagraphStyle('section', fontName='ResumeSans-Bold', fontSize=9.8, leading=12, spaceBefore=9, spaceAfter=3, textColor=ink),
    'body': ParagraphStyle('body', fontName='ResumeSans', fontSize=9.2, leading=12, spaceAfter=3, textColor=ink),
    'entry': ParagraphStyle('entry', fontName='ResumeSans-Bold', fontSize=9.5, leading=12, spaceBefore=4, spaceAfter=2, textColor=ink),
    'meta': ParagraphStyle('meta', fontName='ResumeSans', fontSize=8.5, leading=11, spaceAfter=3, textColor=ink),
    'bullet': ParagraphStyle('bullet', fontName='ResumeSans', fontSize=9.2, leading=12, leftIndent=9, firstLineIndent=-7, spaceAfter=2, textColor=ink),
}
story = []
def p(text, kind='body'):
    story.append(Paragraph(text, styles[kind]))
def section(title):
    p(title.upper(), 'section')
    story.append(HRFlowable(width='100%', thickness=.45, color=colors.HexColor('#a3aab1'), spaceAfter=4))
def bullet(text):
    p('- ' + text, 'bullet')
def link(label, url):
    return f'<link href="{url}"><u>{label}</u></link>'

p('OM SINGH JADON', 'name')
p('Java / Spring Boot / Backend Development', 'contact')
p('Gwalior, India | ' + link('omjadon242@gmail.com', 'mailto:omjadon242@gmail.com'), 'contact')
p(' | '.join([link('Portfolio', 'https://om2412.github.io/'), link('GitHub', 'https://github.com/OM2412'), link('LinkedIn', 'https://www.linkedin.com/in/om-singh-jadon-b92679314/'), link('LeetCode', 'https://leetcode.com/u/Omjadon_24/')]), 'contact')

section('Professional summary')
p('B.Tech student in Computer Science and Business Systems (2028), building Java REST APIs, React interfaces and AI-assisted workflows. Shipped OnceTold and co-built ReturnTrail and SpiderSense, with hands-on debugging, database persistence and deployment experience.')

section('Technical skills')
p('<b>Languages:</b> Java, SQL, Python, JavaScript<br/><b>Backend:</b> Spring Boot, Spring Security, JWT, REST APIs, JPA/Hibernate, FastAPI<br/><b>Frontend and data:</b> React, Next.js, HTML/CSS, PostgreSQL, MySQL, H2<br/><b>Tools and foundations:</b> Git/GitHub, Maven, Docker, Render, Neon, DSA, OOP')

section('Experience')
p('Java Development Internship - Cognifyz Technologies | Jun-Jul 2026', 'entry')
p('Remote, task-based Java assignments | ' + link('Work repository', 'https://github.com/OM2412/Cognifyz-Java-Development-Internship'), 'meta')
bullet('Completed Level 1 and Level 2 through six Java console applications, including a grade calculator, password utilities and Tic-Tac-Toe.')
bullet('Applied input validation, strings, arrays, methods and game logic; documented the work with Git and GitHub.')

section('Selected projects')
p('ReturnTrail - Evidence and Graph Context | Team build | Oct 2026', 'entry')
p('Java, Spring Boot, React, FalkorDB | With Ajeet Gadekar | ' + link('Source', 'https://github.com/OM2412/ReturnTrail') + ' | ' + link('Demo', 'https://returntrail-api.onrender.com/'), 'meta')
bullet('Co-developed a source-linked workflow connecting disputed pickup records, statements and documents in FalkorDB.')
bullet('Used backend-enforced agent tool calls and retained reviewed sources so follow-ups can distinguish earlier explanations from new evidence.')

p('OnceTold - AI Support Ticketing with Memory | Solo build | 2026', 'entry')
p('Spring Boot, React, FastAPI, Cognee, Groq, PostgreSQL | ' + link('Source', 'https://github.com/OM2412/OnceTold') + ' | ' + link('Demo', 'https://oncetold-hrma.onrender.com/'), 'meta')
bullet('Built JWT-authenticated tickets and customer-scoped memory recall; agent resolutions feed later conversations.')
bullet('Migrated the demo from Railway/H2 to Render and Neon PostgreSQL; fixed recall timeouts, schema compatibility and authenticated memory access.')

p('SpiderSense - Competitor Intelligence | Team build | Aug 2026', 'entry')
p('Next.js, Spring Boot, PostgreSQL, Bright Data, AI analysis | With Yogesh Sanodiya | ' + link('Source', 'https://github.com/yogeshsanodiya59-web/SpiderSense') + ' | ' + link('Demo', 'https://spider-sense-beta.vercel.app/'), 'meta')
bullet('Contributed across the frontend and backend to API integration, stored snapshots, deterministic change detection and AI-assisted explanations.')
bullet('Integrated the Bright Data acquisition workflow; kept simulated presentation scenarios distinct from real scraping.')

section('Education and continuing education')
p('<b>B.Tech, Computer Science and Business Systems - MITS Gwalior</b> | 2024-2028')
p('<b>Minor Program in CSE and Advanced Technologies - CCE, IIT Mandi</b><br/>Continuing education: programming, data structures and algorithms, systems and databases. Program credential issued Feb 2026.', 'body')

section('Additional')
p('<b>Problem solving:</b> 150+ LeetCode problems; 50 Days Badge 2026 (profile checked 19 Oct 2026).<br/><b>Student club:</b> Event posters and social creatives for FUNTECH Club, MITS Gwalior, using Canva.')

doc = SimpleDocTemplate(str(destination), pagesize=A4, rightMargin=35, leftMargin=35, topMargin=28, bottomMargin=27, title='Om Singh Jadon - Java Backend Resume', author='Om Singh Jadon', subject='Java and backend internship resume')
doc.build(story)
print(destination)
