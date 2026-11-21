import os
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

PDF_PATH = r"c:\Users\hello\USMLE2\USMLE_Platform_UI_UX_Specification.pdf"

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        if self._pageNumber > 1:
            header_text = "USMLE Pro-Prep Platform - UI/UX Specification & Lovable Design Blueprint"
            self.drawString(54, letter[1] - 36, header_text)
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
            
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 54, 30, page_text)
            self.drawString(54, 30, "CONFIDENTIAL - Product Design Specification")
            self.line(54, 42, letter[0] - 54, 42)
        self.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a")
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0891b2")
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0d9488"),
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b")
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0369a1")
    )

    story = []

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 40))
    story.append(Paragraph("MICRO Q-BANK / USMLE PLATFORM", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("UI/UX Design Specification &<br/>Lovable.dev Implementation Blueprint", title_style))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0d9488"), spaceBefore=5, spaceAfter=20))
    
    meta_data = [
        [Paragraph("<b>Product Vision:</b>", body_style), Paragraph("Next-Generation USMLE Question Bank with High-Yield Video Mnemonics & Dual Theme Simulator", body_style)],
        [Paragraph("<b>Target Audience:</b>", body_style), Paragraph("Medical Students, USMLE Step 1 & Step 2 CK Candidates, Clinical Clerkships", body_style)],
        [Paragraph("<b>Primary Tech Stack:</b>", body_style), Paragraph("Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Video Streaming", body_style)],
        [Paragraph("<b>Lovable Compatibility:</b>", body_style), Paragraph("Vite + React 19 + Tailwind CSS Component Tokens (Ready for GitHub sync or prompt import)", body_style)],
        [Paragraph("<b>Live Preview URL:</b>", body_style), Paragraph("<font color='#0284c7'><u>https://bracelets-height-quarters-bbs.trycloudflare.com</u></font>", body_style)],
        [Paragraph("<b>Version / Date:</b>", body_style), Paragraph("Version 2.4 - Production Release / 2026", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[130, 374])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 25))

    overview_p = """
    <b>Executive Overview:</b><br/>
    This document outlines the visual design, screen taxonomy, interactive states, and design tokens for the Micro Q-Bank commercial platform. 
    It is specifically crafted to serve as an authoritative UI/UX design package for product stakeholders and as a complete prompt & structural blueprint for <b>Lovable.dev</b>.
    """
    story.append(Paragraph(overview_p, body_style))
    story.append(Spacer(1, 20))

    # Approaches box
    lovable_intro = [
        [Paragraph("<b>The Best Approach to Use Lovable.dev For This Platform:</b><br/>"
                   "<b>1. Direct GitHub Sync (Best for Full Development):</b> Push this codebase to GitHub and link it in Lovable. Lovable will render all existing Tailwind components, routes, and layout structures directly.<br/>"
                   "<b>2. Prompt + Screenshot Import (Best for UI Iteration):</b> Upload the high-resolution screenshots in this PDF directly to Lovable's prompt interface along with the Tailwind recipes provided on each page.<br/>"
                   "<b>3. Live View URL Inspection:</b> Use the active Cloudflare live tunnel link above to let Lovable inspect live interactive states.", callout_style)]
    ]
    t_lovable_intro = Table(lovable_intro, colWidths=[504])
    t_lovable_intro.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ecfeff")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#06b6d4")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_lovable_intro)

    story.append(PageBreak())

    # ==================== DESIGN SYSTEM & TOKENS ====================
    story.append(Paragraph("1. Design System & Visual Tokens", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=4, spaceAfter=14))

    tokens_intro = """
    The platform employs a dual-theme visual architecture:
    <b>A. Modern Minimalist (Consumer & Storefront):</b> Soft slate neutrals (#0f172a, #f8fafc), clinical cyan (#0891b2), deep teal (#0f766e), and subtle backdrop blurs.<br/>
    <b>B. UWorld Clinical Simulator (Examination Player):</b> High-contrast medical board exam styling (#2d3748, #e2e8f0, #1a202c, #4a5568) engineered to eliminate cognitive surprise during the actual USMLE Step 1 & 2 examinations.
    """
    story.append(Paragraph(tokens_intro, body_style))
    story.append(Spacer(1, 12))

    color_tokens = [
        ["Token Name", "Hex Code", "Tailwind Class", "Role / Usage Context"],
        ["Slate Dark (Primary)", "#0f172a", "bg-slate-900 / text-slate-900", "Headings, primary buttons, high-contrast text"],
        ["Medical Cyan (Accent)", "#0891b2", "bg-cyan-600 / text-cyan-600", "Interactive states, focus rings, video accents"],
        ["Clinical Teal", "#0f766e", "bg-teal-700 / text-teal-700", "Success indicators, badges, brand accents"],
        ["Canvas Background", "#f8fafc", "bg-slate-50", "Main viewport background, soft eye fatigue reduction"],
        ["Card Surface", "#ffffff", "bg-white", "Elevated cards, simulator questions, modals"],
        ["UWorld Simulator Blue", "#1e3a5f", "bg-[#1e3a5f]", "Top navigation bar in UWorld exam mode"],
        ["Correct Answer Green", "#10b981", "bg-emerald-500 / border-emerald-500", "Answer rationale confirmation, correct choices"],
        ["Distractor Red", "#ef4444", "bg-rose-500 / text-rose-500", "Incorrect choice strike-through & analytics"]
    ]
    t_colors = Table(color_tokens, colWidths=[110, 60, 150, 184])
    t_colors.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 5),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
    ]))
    story.append(t_colors)
    story.append(Spacer(1, 14))

    typography_intro = """
    <b>Typography Hierarchy:</b><br/>
    • <b>Headings:</b> Merriweather / Fraunces (Clinical Editorial Serif) & Inter (Sans-Serif Geometric).<br/>
    • <b>Vignette & Question Body:</b> Inter / Arial (15px, 1.6 line height for fast scanning and board exam parity).<br/>
    • <b>Monospace (Lab Values, Code, Timers):</b> JetBrains Mono / SFMono (tabular numbers for accurate timer countdown).
    """
    story.append(Paragraph(typography_intro, body_style))

    story.append(PageBreak())

    # Helper function to add a screen section
    def add_screen_section(screen_num, title, route, img_path, desc, components_list, lovable_prompt):
        story.append(Paragraph(f"Screen {screen_num}: {title}", h1_style))
        story.append(Paragraph(f"<b>Route:</b> <font color='#0284c7'><code>{route}</code></font>", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=4, spaceAfter=10))

        story.append(Paragraph(f"<b>UX Concept:</b> {desc}", body_style))
        story.append(Spacer(1, 8))

        # Add Image if exists
        if os.path.exists(img_path):
            # Letter width is 612, minus margins (108) = 504 pt available width
            img_w = 504
            img_h = 280
            story.append(Image(img_path, width=img_w, height=img_h))
            story.append(Spacer(1, 8))

        # Components table
        comp_data = [["Key UI Component", "Design Pattern & Interactive Behavior"]]
        for c_name, c_desc in components_list:
            comp_data.append([Paragraph(f"<b>{c_name}</b>", body_style), Paragraph(c_desc, body_style)])
        
        t_comp = Table(comp_data, colWidths=[150, 354])
        t_comp.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('PADDING', (0,0), (-1,-1), 4),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ]))
        story.append(t_comp)
        story.append(Spacer(1, 8))

        # Lovable Prompt Box
        prompt_data = [[
            Paragraph(f"<b>Lovable.dev Prompt Recipe:</b><br/><font color='#0369a1'><code>{lovable_prompt}</code></font>", callout_style)
        ]]
        t_prompt = Table(prompt_data, colWidths=[504])
        t_prompt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0284c7")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_prompt)
        story.append(PageBreak())

    # ==================== SCREEN 1: LANDING PAGE ====================
    add_screen_section(
        screen_num=1,
        title="Modern Clinical Landing Page",
        route="/",
        img_path=r"c:\Users\hello\USMLE2\screenshots\screen1_landing.png",
        desc="A high-conversion, professional landing page tailored for medical candidates. Emphasizes clinical precision, interactive video previews, and avoids generic AI-style hype metrics.",
        components_list=[
            ("Hero Headline & Badge", "Editorial serif headline with gradient accent and animated pulsing status indicator ('Clinical-Grade USMLE Preparation')."),
            ("Interactive Simulator Hero", "Embedded interactive board-style question preview with functional option selection, distractor explanation reveal, and smooth cursor animation."),
            ("Call-to-Action Cluster", "Instant 'Launch Test Player' direct demo button paired with 'Explore Q-Banks' storefront navigation."),
            ("Feature Cards Matrix", "Three distinct cards detailing Timed & Tutor Modes, Embedded Video Mnemonics, and Modular System Access.")
        ],
        lovable_prompt="Create a high-converting medical landing page with Tailwind CSS. Hero section with Merriweather headline 'Master USMLE Concepts One Topic at a Time', animated interactive UWorld exam preview card on right side with clickable options, launch demo CTA button, and 3 feature cards below."
    )

    # ==================== SCREEN 2: TEST PLAYER DEMO ====================
    add_screen_section(
        screen_num=2,
        title="Authentic Board Exam Test Player (UWorld Parity)",
        route="/demo",
        img_path=r"c:\Users\hello\USMLE2\screenshots\screen2_demo_testplayer.png",
        desc="100% authentic USMLE Step 1 / Step 2 CK board exam simulation. Includes option elimination (strike-through), question flagging, live timer, clinical exhibits, lab values modal, and high-yield video mnemonics.",
        components_list=[
            ("UWorld Header Toolbar", "Authentic top bar featuring Previous/Next navigation, Question Flagging, Lab Values, Calculator, Pause Block, and End Test buttons."),
            ("Clinical Vignette & Options", "Realistic clinical presentation with strike-through distractor support (Option A-E) and instant tutor rationale breakdown upon submission."),
            ("Video Mnemonic Player Container", "Embedded HLS/MP4 video player streaming high-yield animations directly explaining the pathophysiology and pharmacological target of the question."),
            ("Anti-Piracy Watermark", "Dynamic semi-transparent canvas overlay displaying floating user credentials across the video container to prevent unauthorized screen-capture.")
        ],
        lovable_prompt="Build a full UWorld-style USMLE exam simulator. Top banner in dark slate with Prev/Next, Mark, Labs, Calc buttons. Split panel view: clinical vignette on left with radio options and strike-through capability; on submit, reveal distractor explanation and embedded video player modal with anti-piracy drifting canvas watermark."
    )

    # ==================== SCREEN 3: Q-BANK STOREFRONT ====================
    add_screen_section(
        screen_num=3,
        title="Modular Q-Bank Catalog Storefront",
        route="/store",
        img_path=r"c:\Users\hello\USMLE2\screenshots\screen3_store.png",
        desc="System-by-system Q-Bank marketplace allowing medical students to purchase individual organ modules (Autoimmune, Immunodeficiency, Biologics, Histology, Pharmacology) without bloated subscriptions.",
        components_list=[
            ("Specialty Filter Tabs", "Pill-style filters to toggle between All Systems, Immunology, Pharmacology, Histology, and Pathology."),
            ("Product Module Cards", "Clear pricing ($29.00 - $39.00), total question counts (50 Qs/bank), video mnemonic badges, and high-yield topic summaries."),
            ("Direct Checkout Flow", "One-click 'Unlock Bank' triggers seamless Stripe / checkout session with lifetime module access."),
            ("Sample Preview Trigger", "Allows candidates to sample 3 questions from each bank before purchasing.")
        ],
        lovable_prompt="Create a modern medical e-commerce storefront for modular USMLE question banks. Include filter tabs for medical specialties, card grid showing price, question count, video mnemonic tags, and an 'Unlock Q-Bank' button."
    )

    # ==================== SCREEN 4: CUSTOM TEST CREATION ====================
    add_screen_section(
        screen_num=4,
        title="UWorld Custom Test Creation Matrix",
        route="/dashboard/create-test",
        img_path=r"c:\Users\hello\USMLE2\screenshots\screen4_create_test.png",
        desc="Complete replica of the UWorld test generation matrix. Empowers students to configure customized exam blocks based on mode, question status pool, organ systems, and exact question count.",
        components_list=[
            ("Test Mode Selector", "Radio button cards to switch between Timed (strict board pace) and Tutor (immediate distractor rationale) modes."),
            ("Question Status Pool", "Filter matrix allowing selection of Unused (new), Incorrect (remediation), Marked (flagged items), or All questions with live available counters."),
            ("Organ System Multi-Select", "Checkboxes for Autoimmune, Immunodeficiency, Biologics, Histology, and Pharmacology with 'Select All' toggle."),
            ("Question Slider & Start Block", "1 to 40 question interactive slider with instant block creation and automatic test player initialization.")
        ],
        lovable_prompt="Create an advanced USMLE custom test creator. Radio cards for Timed vs Tutor mode, question status checkboxes (Unused, Incorrect, Marked), multi-select organ systems list with badges, and a 1-40 question slider with a 'Generate Test Block' CTA."
    )

    # ==================== SCREEN 5: PEER ANALYTICS & SCORE PREDICTOR ====================
    add_screen_section(
        screen_num=5,
        title="Comparative Peer Analytics & Score Predictor",
        route="/dashboard/performance",
        img_path=r"c:\Users\hello\USMLE2\screenshots\screen5_performance.png",
        desc="Comprehensive performance analytics dashboard comparing user accuracy against thousands of peer medical candidates. Projects USMLE Step 1 pass likelihood and identifies subtopic weaknesses.",
        components_list=[
            ("Step 1 Pass Predictor Gauge", "Probability dial with 95%+ confidence interval based on cumulative first-pass percentage."),
            ("Peer Percentile Bell Curve", "Normalized distribution curve highlighting user's standing compared to the national average (e.g. 74th percentile)."),
            ("Organ-System Mastery Bars", "Color-coded accuracy progress bars across all tested medical specialties with instant remediation triggers."),
            ("Pace & Time Allocation", "Average seconds spent per question versus peer benchmark (target: 72s per USMLE item).")
        ],
        lovable_prompt="Build a medical performance analytics dashboard with Step 1 Pass Likelihood card, peer percentile comparison chart, organ system mastery progress bars, and timing metrics."
    )

    # ==================== SCREEN 6: SPACED REPETITION FLASHCARDS ====================
    add_screen_section(
        screen_num=6,
        title="Spaced Repetition Flashcard Review Suite",
        route="/dashboard/flashcards",
        img_path=r"c:\Users\hello\USMLE2\screenshots\screen6_flashcards.png",
        desc="Active recall suite implementing the SuperMemo SM-2 algorithm. Converts missed test questions and high-yield video mnemonic pearls into scheduled review cards.",
        components_list=[
            ("3D Flip Flashcard", "Interactive card showing clinical presentation on the front and flipping to reveal concept synthesis + video snapshot on the back."),
            ("SM-2 Rating Controls", "Four standardized review difficulty buttons: Again (<1d), Hard (1d), Good (3d), Easy (7d) updating the interval multiplier."),
            ("Deck Statistics Header", "Counters displaying New, Learning, and Due cards for today's review session."),
            ("Associated Video Mnemonic Link", "Quick-tap pill to pop up the corresponding 2-minute video mnemonic for instant mechanism clarification.")
        ],
        lovable_prompt="Build an Anki/Spaced Repetition flashcard review interface for medical students. Flip card animation revealing answer and mnemonic diagram, with Again, Hard, Good, Easy buttons calculating SM-2 intervals."
    )

    # ==================== SCREEN 7: LOVABLE IMPLEMENTATION STRATEGY ====================
    story.append(Paragraph("3. Recommended Approaches for Lovable.dev", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=4, spaceAfter=14))

    lovable_guide = """
    <b>How to Best Leverage Lovable.dev for This Project:</b><br/>
    Lovable (<i>lovable.dev</i>) is an AI-native frontend and full-stack web builder that excels at rapidly turning designs, components, and user prompts into clean React + Vite + Tailwind code.<br/><br/>
    
    <b>Strategy A: GitHub Repository Connection (Highest Fidelity - Recommended)</b><br/>
    1. Push this project repository to your private GitHub account.<br/>
    2. In Lovable, select <b>'Import from GitHub'</b> and connect the repository.<br/>
    3. Lovable will immediately recognize all existing Next.js pages, Tailwind configuration, and Lucide icons.<br/>
    4. You can prompt Lovable to adjust animations, redesign layout grids, or test visual variations with instant preview and bidirectional Git commits.<br/><br/>
    
    <b>Strategy B: Visual Blueprint & Prompt Injection (Zero-Config Exploration)</b><br/>
    1. Extract the PNG screenshots from this document (saved in <code>/screenshots</code>).<br/>
    2. In a new Lovable project, paste the <b>Lovable.dev Prompt Recipe</b> provided on each screen page along with the matching screenshot.<br/>
    3. Tell Lovable: <i>'Recreate this exact screen layout using Tailwind CSS with clinical medical styling. Follow the provided tokens and component hierarchy.'</i><br/>
    4. Lovable will generate the interactive UI, which can then be merged back into this repository.<br/><br/>

    <b>Strategy C: Live View Inspection via Tunnel</b><br/>
    1. Lovable can inspect live URLs to analyze styling and accessibility.<br/>
    2. Share the active live view tunnel link:<br/>
    <font color='#0284c7'><b>https://bracelets-height-quarters-bbs.trycloudflare.com</b></font><br/>
    3. This gives immediate access to the running application on any browser or remote device.
    """
    story.append(Paragraph(lovable_guide, body_style))
    story.append(Spacer(1, 20))

    summary_box = [
        [Paragraph("<b>Status:</b> All 5 Question Banks (250 Questions), 1.77 GB Video Mnemonics, Anti-Piracy Player, and Custom Test Creator are fully operational on the local and tunneled servers.", callout_style)]
    ]
    t_sum = Table(summary_box, colWidths=[504])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#22c55e")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sum)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at {PDF_PATH}")

if __name__ == "__main__":
    build_pdf()
