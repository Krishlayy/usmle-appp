import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2

WIDTH = 960
HEIGHT = 580
FPS = 30
TOTAL_FRAMES = 180  # 6 seconds

# Load fonts
font_path_regular = "C:/Windows/Fonts/segoeui.ttf"
font_path_bold = "C:/Windows/Fonts/segoeuib.ttf"
if not os.path.exists(font_path_bold):
    font_path_bold = "C:/Windows/Fonts/arialbd.ttf"
if not os.path.exists(font_path_regular):
    font_path_regular = "C:/Windows/Fonts/arial.ttf"

font_title = ImageFont.truetype(font_path_bold, 15)
font_label = ImageFont.truetype(font_path_bold, 11)
font_item = ImageFont.truetype(font_path_regular, 14)
font_item_bold = ImageFont.truetype(font_path_bold, 14)
font_small = ImageFont.truetype(font_path_regular, 11)
font_small_bold = ImageFont.truetype(font_path_bold, 11)

def ease_in_out(t):
    return t * t * (3 - 2 * t)

def draw_cursor(draw, x, y, clicking=False, scale=1.0):
    # Modern Mac/Linear style pointer cursor
    pts = [
        (x, y),
        (x, y + 22 * scale),
        (x + 5.5 * scale, y + 17 * scale),
        (x + 11.5 * scale, y + 27 * scale),
        (x + 15 * scale, y + 25 * scale),
        (x + 9 * scale, y + 15.5 * scale),
        (x + 16.5 * scale, y + 15.5 * scale),
    ]
    # Draw shadow
    shadow_pts = [(px + 2, py + 3) for px, py in pts]
    draw.polygon(shadow_pts, fill=(0, 0, 0, 40))
    # Draw cursor fill and border
    draw.polygon(pts, fill=(15, 23, 42, 255))
    draw.line(pts + [pts[0]], fill=(255, 255, 255, 255), width=2)

def generate_video():
    output_path = os.path.join("public", "videos", "hero-simulator.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, FPS, (WIDTH, HEIGHT))

    print(f"Generating {TOTAL_FRAMES} frames into {output_path}...")

    # Options coordinates relative to main area
    # Main card is at (x=40, y=30, w=880, h=520)
    # Navigator: x=40..160
    # Content: x=180..900

    for frame_idx in range(TOTAL_FRAMES):
        # Create base canvas with soft clinical gradient
        img = Image.new("RGBA", (WIDTH, HEIGHT), (248, 250, 252, 255))
        draw = ImageDraw.Draw(img)

        # Ambient background glow
        draw.ellipse([450, -50, 850, 350], fill=(224, 242, 254, 120))
        draw.ellipse([-50, 300, 350, 700], fill=(238, 242, 255, 100))

        # Main Simulator Window
        win_x0, win_y0, win_x1, win_y1 = 40, 30, 920, 550
        # Window Shadow
        for s in range(6, 0, -1):
            draw.rounded_rectangle(
                [win_x0 - s, win_y0 - s, win_x1 + s, win_y1 + s],
                radius=16,
                fill=(15, 23, 42, 4 * s)
            )
        # Window Body
        draw.rounded_rectangle([win_x0, win_y0, win_x1, win_y1], radius=16, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=1)

        # Header Bar
        hdr_h = 42
        draw.rounded_rectangle([win_x0, win_y0, win_x1, win_y0 + hdr_h], radius=16, fill=(248, 250, 252, 255))
        draw.rectangle([win_x0, win_y0 + 20, win_x1, win_y0 + hdr_h], fill=(248, 250, 252, 255))
        draw.line([win_x0, win_y0 + hdr_h, win_x1, win_y0 + hdr_h], fill=(226, 232, 240, 255), width=1)

        # Window Controls (mac-style dots)
        draw.ellipse([win_x0 + 16, win_y0 + 15, win_x0 + 28, win_y0 + 27], fill=(248, 113, 113, 255))
        draw.ellipse([win_x0 + 36, win_y0 + 15, win_x0 + 48, win_y0 + 27], fill=(250, 204, 21, 255))
        draw.ellipse([win_x0 + 56, win_y0 + 15, win_x0 + 68, win_y0 + 27], fill=(74, 222, 128, 255))

        # Header Title
        title_text = "CLINICAL SIMULATOR  •  TUTOR MODE"
        draw.text((win_x0 + 84, win_y0 + 14), title_text, fill=(100, 116, 139, 255), font=font_label)

        # Navigator Sidebar (Left)
        nav_w = 120
        nav_x0 = win_x0
        nav_x1 = win_x0 + nav_w
        nav_y0 = win_y0 + hdr_h
        nav_y1 = win_y1
        draw.rectangle([nav_x0, nav_y0, nav_x1, nav_y1 - 10], fill=(248, 250, 252, 255))
        draw.line([nav_x1, nav_y0, nav_x1, nav_y1], fill=(226, 232, 240, 255), width=1)

        draw.text((nav_x0 + 14, nav_y0 + 18), "NAVIGATOR", fill=(148, 163, 184, 255), font=font_small_bold)

        # Nav items
        for i in range(1, 6):
            item_y = nav_y0 + 44 + (i - 1) * 38
            if i == 1:
                draw.rounded_rectangle([nav_x0 + 10, item_y, nav_x1 - 10, item_y + 30], radius=6, fill=(224, 242, 254, 255), outline=(186, 230, 253, 255))
                draw.ellipse([nav_x0 + 20, item_y + 11, nav_x0 + 28, item_y + 19], fill=(2, 132, 199, 255))
                draw.text((nav_x0 + 36, item_y + 7), f"Item {i}", fill=(2, 132, 199, 255), font=font_small_bold)
                draw.text((nav_x1 - 24, item_y + 7), "★", fill=(234, 88, 12, 255), font=font_small)
            else:
                draw.rounded_rectangle([nav_x0 + 10, item_y, nav_x1 - 10, item_y + 30], radius=6, fill=(255, 255, 255, 255), outline=(241, 245, 249, 255))
                draw.ellipse([nav_x0 + 20, item_y + 11, nav_x0 + 28, item_y + 19], fill=(203, 213, 225, 255))
                draw.text((nav_x0 + 36, item_y + 7), f"Item {i}", fill=(100, 116, 139, 255), font=font_small)

        # Main Question Content Area (Right)
        cx0 = nav_x1 + 30
        cy0 = nav_y0 + 20

        # Badge: Confidential Clinical Case
        draw.rounded_rectangle([cx0, cy0, cx0 + 190, cy0 + 24], radius=12, fill=(238, 242, 255, 255), outline=(224, 231, 255, 255))
        draw.text((cx0 + 12, cy0 + 5), "CASE SIMULATION • CARDIOVASCULAR", fill=(79, 70, 229, 255), font=font_small_bold)

        # Abstract Clinical Vignette Redacted Skeleton (Does NOT reveal confidential exam questions!)
        # 3 smooth rounded skeleton bars of varying lengths
        draw.rounded_rectangle([cx0, cy0 + 36, cx0 + 640, cy0 + 46], radius=5, fill=(226, 232, 240, 255))
        draw.rounded_rectangle([cx0, cy0 + 54, cx0 + 590, cy0 + 64], radius=5, fill=(226, 232, 240, 255))
        draw.rounded_rectangle([cx0, cy0 + 72, cx0 + 420, cy0 + 82], radius=5, fill=(226, 232, 240, 255))

        # Question prompt bar
        draw.rounded_rectangle([cx0, cy0 + 96, cx0 + 500, cy0 + 107], radius=5, fill=(203, 213, 225, 255))

        # Timeline Phases
        # Frame 0..30: Static initial state
        # Frame 30..80: Cursor moves to Option A
        # Frame 80..95: Click action
        # Frame 95..160: Option A selected, Video Mnemonic opens
        # Frame 160..180: Hold and loop
        is_hovered = False
        is_selected = frame_idx >= 88
        click_frame = 84

        opt_y_base = cy0 + 125
        opt_w = 660
        opt_h = 42

        # Options Data
        options = [
            ("A", "Primary Diagnostic Hypothesis & Systematic Differential", True),
            ("B", "Secondary Alternative Physiological Mechanism", False),
            ("C", "Non-contributory Pathological Presentation", False),
            ("D", "Low-probability Distractor Etiology", False),
        ]

        # Calculate Cursor Position
        start_cur_x, start_cur_y = cx0 + 550, opt_y_base + 220
        target_cur_x, target_cur_y = cx0 + 180, opt_y_base + 20

        if frame_idx < 30:
            cur_x, cur_y = start_cur_x, start_cur_y
        elif frame_idx < 80:
            prog = ease_in_out((frame_idx - 30) / 50.0)
            cur_x = start_cur_x + (target_cur_x - start_cur_x) * prog
            cur_y = start_cur_y + (target_cur_y - start_cur_y) * prog
            if prog > 0.8:
                is_hovered = True
        elif frame_idx < 130:
            cur_x, cur_y = target_cur_x, target_cur_y
            is_hovered = True
        else:
            # Retract slowly
            prog = ease_in_out(min(1.0, (frame_idx - 130) / 40.0))
            cur_x = target_cur_x + (start_cur_x - target_cur_x) * prog * 0.4
            cur_y = target_cur_y + (start_cur_y - target_cur_y) * prog * 0.4

        # Draw Options
        for idx, (letter, text, is_correct) in enumerate(options):
            oy = opt_y_base + idx * 50

            # Option A special behavior
            if idx == 0:
                if is_selected:
                    bg_fill = (236, 253, 245, 255)
                    border_fill = (16, 185, 129, 255)
                    badge_fill = (16, 185, 129, 255)
                    text_fill = (6, 95, 70, 255)
                    letter_fill = (255, 255, 255, 255)
                elif is_hovered:
                    bg_fill = (240, 253, 250, 255)
                    border_fill = (13, 148, 136, 255)
                    badge_fill = (204, 251, 241, 255)
                    text_fill = (15, 23, 42, 255)
                    letter_fill = (13, 148, 136, 255)
                else:
                    bg_fill = (255, 255, 255, 255)
                    border_fill = (226, 232, 240, 255)
                    badge_fill = (241, 245, 249, 255)
                    text_fill = (51, 65, 85, 255)
                    letter_fill = (100, 116, 139, 255)
            elif idx == 1:
                # Option B struck-through look
                bg_fill = (250, 250, 250, 255)
                border_fill = (241, 245, 249, 255)
                badge_fill = (241, 245, 249, 255)
                text_fill = (148, 163, 184, 255)
                letter_fill = (148, 163, 184, 255)
            else:
                bg_fill = (255, 255, 255, 255)
                border_fill = (226, 232, 240, 255)
                badge_fill = (241, 245, 249, 255)
                text_fill = (51, 65, 85, 255)
                letter_fill = (100, 116, 139, 255)

            # Draw Option Card
            draw.rounded_rectangle([cx0, oy, cx0 + opt_w, oy + opt_h], radius=10, fill=bg_fill, outline=border_fill, width=1)

            # Option Letter Badge (Circle)
            draw.ellipse([cx0 + 12, oy + 9, cx0 + 36, oy + 33], fill=badge_fill)
            draw.text((cx0 + 19, oy + 12), letter, fill=letter_fill, font=font_item_bold)

            # Option Text
            draw.text((cx0 + 48, oy + 12), text, fill=text_fill, font=font_item)

            # Strike through on Option B
            if idx == 1:
                draw.line([cx0 + 48, oy + 21, cx0 + 440, oy + 21], fill=(203, 213, 225, 255), width=2)

            # Correct Checkmark on Option A when selected
            if idx == 0 and is_selected:
                draw.text((cx0 + opt_w - 95, oy + 13), "✓ CORRECT", fill=(16, 185, 129, 255), font=font_small_bold)

        # Video Mnemonic & Explanation Reveal Panel
        if is_selected:
            reveal_prog = min(1.0, (frame_idx - 88) / 15.0)
            reveal_h = int(68 * reveal_prog)
            ry0 = opt_y_base + 4 * 50 + 6
            ry1 = ry0 + reveal_h

            if reveal_h > 15:
                # Panel background
                draw.rounded_rectangle([cx0, ry0, cx0 + opt_w, ry1], radius=10, fill=(240, 253, 250, 255), outline=(153, 246, 228, 255), width=1)
                
                if reveal_h >= 50:
                    # Video Mnemonic Capsule
                    draw.rounded_rectangle([cx0 + 16, ry0 + 14, cx0 + 200, ry0 + 42], radius=8, fill=(13, 148, 136, 255))
                    draw.text((cx0 + 28, ry0 + 19), "▶  VIDEO MNEMONIC  (1:45)", fill=(255, 255, 255, 255), font=font_small_bold)

                    draw.text((cx0 + 218, ry0 + 16), "Systematic Clinical Rationale & High-Yield Pearls Unlocked", fill=(15, 23, 42, 255), font=font_small_bold)
                    draw.text((cx0 + 218, ry0 + 34), "Interactive visual memory aid reinforces the core physiologic pathology.", fill=(100, 116, 139, 255), font=font_small)

        # Click Ripple Effect
        if 84 <= frame_idx <= 96:
            ripple_r = (frame_idx - 84) * 3
            ripple_alpha = int(180 * (1 - (frame_idx - 84) / 12.0))
            draw.ellipse([cur_x - ripple_r, cur_y - ripple_r, cur_x + ripple_r, cur_y + ripple_r], outline=(13, 148, 136, ripple_alpha), width=2)

        # Draw Cursor
        draw_cursor(draw, cur_x, cur_y, clicking=(84 <= frame_idx <= 90))

        # Convert to BGR for OpenCV
        rgb_frame = img.convert("RGB")
        bgr_frame = cv2.cvtColor(np.array(rgb_frame), cv2.COLOR_RGB2BGR)
        out.write(bgr_frame)

    out.release()
    print("Done! Video saved successfully.")

if __name__ == "__main__":
    generate_video()
