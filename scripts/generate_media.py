"""
Generate high-fidelity media assets for AutoElektronik:
1. public/apple-touch-icon.png (180x180 PNG)
2. public/images/autoelektronik-social-share.jpg (1200x630 JPG)
3. public/videos/abs-module-repair-lab.mp4 (1280x720 MP4)
"""

import os
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
IMAGES_DIR = os.path.join(PUBLIC_DIR, "images")
VIDEOS_DIR = os.path.join(PUBLIC_DIR, "videos")

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)

FONT_PATH_REGULAR = "C:\\Windows\\Fonts\\segoeui.ttf"
FONT_PATH_BOLD = "C:\\Windows\\Fonts\\segoeuib.ttf"
if not os.path.exists(FONT_PATH_BOLD):
    FONT_PATH_BOLD = "C:\\Windows\\Fonts\\arialbd.ttf"
if not os.path.exists(FONT_PATH_REGULAR):
    FONT_PATH_REGULAR = "C:\\Windows\\Fonts\\arial.ttf"

# -------------------------------------------------------------
# 1. Generate Apple Touch Icon (180x180)
# -------------------------------------------------------------
def generate_apple_touch_icon():
    out_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    size = (180, 180)
    img = Image.new("RGBA", size, (15, 118, 110, 255)) # #0F766E
    draw = ImageDraw.Draw(img)

    # Rounded rectangle border glow
    draw.rounded_rectangle([4, 4, 175, 175], radius=36, fill=(15, 118, 110, 255), outline=(45, 212, 191, 180), width=4)

    # Lightning path scaled to 180x180
    # Original SVG viewBox="0 0 100 100": M55 20L25 55H50L45 80L75 45H50L55 20Z
    # Centered in 180x180 with scale 1.3, offset (25, 25)
    points = [
        (55 * 1.3 + 25, 20 * 1.3 + 25),
        (25 * 1.3 + 25, 55 * 1.3 + 25),
        (50 * 1.3 + 25, 55 * 1.3 + 25),
        (45 * 1.3 + 25, 80 * 1.3 + 25),
        (75 * 1.3 + 25, 45 * 1.3 + 25),
        (50 * 1.3 + 25, 45 * 1.3 + 25),
    ]
    draw.polygon(points, fill=(255, 255, 255, 255))

    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({os.path.getsize(out_path)} bytes)")

# -------------------------------------------------------------
# 2. Generate Social Share Open Graph Banner (1200x630)
# -------------------------------------------------------------
def generate_social_share():
    out_path = os.path.join(IMAGES_DIR, "autoelektronik-social-share.jpg")
    width, height = 1200, 630

    # Create dark gradient background: #0B132B to #0F172A with teal accents
    base = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        # Vertical gradient from deep navy to slate
        ratio = y / height
        r = int(11 * (1 - ratio) + 15 * ratio)
        g = int(19 * (1 - ratio) + 23 * ratio)
        b = int(43 * (1 - ratio) + 42 * ratio)
        base[y, :] = [r, g, b]

    # Add radial teal ambient glow in top-right and bottom-left
    y_coords, x_coords = np.ogrid[:height, :width]
    dist_tr = np.sqrt((x_coords - 1000)**2 + (y_coords - 150)**2)
    glow_tr = np.clip(1.0 - (dist_tr / 600.0), 0.0, 1.0)
    base[:, :, 1] = np.clip(base[:, :, 1] + (glow_tr * 70).astype(np.uint8), 0, 255)
    base[:, :, 2] = np.clip(base[:, :, 2] + (glow_tr * 60).astype(np.uint8), 0, 255)

    img = Image.fromarray(base, mode="RGB")
    draw = ImageDraw.Draw(img)

    # Fonts
    font_brand = ImageFont.truetype(FONT_PATH_BOLD, 54)
    font_tagline = ImageFont.truetype(FONT_PATH_REGULAR, 26)
    font_h2 = ImageFont.truetype(FONT_PATH_BOLD, 36)
    font_badge = ImageFont.truetype(FONT_PATH_BOLD, 19)
    font_footer = ImageFont.truetype(FONT_PATH_REGULAR, 20)

    # Decorative frame
    draw.rounded_rectangle([30, 30, width - 30, height - 30], radius=24, outline=(45, 212, 191, 100), width=2)

    # Logo Mark Box
    draw.rounded_rectangle([70, 70, 160, 160], radius=20, fill=(15, 118, 110))
    # Lightning bolt inside logo
    logo_pts = [
        (70 + 50, 70 + 20),
        (70 + 22, 70 + 50),
        (70 + 44, 70 + 50),
        (70 + 40, 70 + 72),
        (70 + 68, 70 + 42),
        (70 + 46, 70 + 42),
    ]
    draw.polygon(logo_pts, fill=(255, 255, 255))

    # Brand Title
    draw.text((180, 75), "Auto", fill=(255, 255, 255), font=font_brand)
    bbox_auto = draw.textbbox((180, 75), "Auto", font=font_brand)
    draw.text((bbox_auto[2], 75), "Elektronik", fill=(45, 212, 191), font=font_brand)
    draw.text((182, 135), "СЕРВИЗ И ЛАБОРАТОРИЯ ЗА АВТОМОБИЛНА ЕЛЕКТРОНИКА", fill=(148, 163, 184), font=font_tagline)

    # Main Headline
    draw.text((70, 210), "Експертен Ремонт на ABS Модули, ECU Компютри & Табла", fill=(241, 245, 249), font=font_h2)

    # Badges / Service Pills
    services = [
        ("🔧 Ремонт на ABS/ESP помпи", (30, 41, 59), (45, 212, 191)),
        ("⚡ ECU двигателни компютри", (30, 41, 59), (45, 212, 191)),
        ("📟 Автомобилни табла & LCD", (30, 41, 59), (45, 212, 191)),
        ("🔬 Компютърна автодиагностика", (30, 41, 59), (45, 212, 191)),
    ]

    bx, by = 70, 290
    for title, bg_col, border_col in services:
        tb = draw.textbbox((bx + 18, by + 12), title, font=font_badge)
        bw = tb[2] - bx + 22
        draw.rounded_rectangle([bx, by, bx + bw, by + 48], radius=14, fill=bg_col, outline=border_col, width=2)
        draw.text((bx + 18, by + 12), title, fill=(241, 245, 249), font=font_badge)
        bx += bw + 18

    # Value props
    v_props = [
        "✓ 12 месеца пълна писмена гаранция без ограничение в пробега",
        "✓ Ултразвуково микрозапояване на бондинг нишки (IPC-7711/7721)",
        "✓ Запазване на оригиналния софтуер, кодировки и VIN на колата",
        "✓ Експресна диагностика и приемане по куриер от цяла България",
    ]
    vy = 375
    font_v = ImageFont.truetype(FONT_PATH_REGULAR, 22)
    for vp in v_props:
        draw.text((70, vy), vp, fill=(203, 213, 225), font=font_v)
        vy += 38

    # Bottom Contact Bar
    draw.rounded_rectangle([70, 540, width - 70, 595], radius=12, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    footer_text = "📍 София, бул. „Цариградско шосе“ №115   |   📞 +359 88 812 3456   |   🌐 autoelektronik-service.bg"
    draw.text((95, 554), footer_text, fill=(148, 163, 184), font=font_footer)

    img.save(out_path, "JPEG", quality=95, optimize=True)
    print(f"Generated {out_path} ({os.path.getsize(out_path)} bytes)")

# -------------------------------------------------------------
# 3. Generate MP4 Laboratory Video (1280x720)
# -------------------------------------------------------------
def generate_mp4_video():
    out_path = os.path.join(VIDEOS_DIR, "abs-module-repair-lab.mp4")
    width, height = 1280, 720
    fps = 24
    duration_sec = 6
    total_frames = fps * duration_sec

    # OpenCV VideoWriter with mp4v codec
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(out_path, fourcc, float(fps), (width, height))

    if not out.isOpened():
        raise RuntimeError("Could not open VideoWriter with mp4v")

    for f in range(total_frames):
        # Time in seconds
        t = f / fps

        # Background canvas in RGB
        frame_rgb = np.zeros((height, width, 3), dtype=np.uint8)
        # Deep blue-grey background
        frame_rgb[:] = (15, 23, 42)

        # Convert to PIL for crisp Bulgarian typography
        pil_img = Image.fromarray(frame_rgb)
        draw = ImageDraw.Draw(pil_img)

        font_title = ImageFont.truetype(FONT_PATH_BOLD, 36)
        font_sub = ImageFont.truetype(FONT_PATH_REGULAR, 24)
        font_status = ImageFont.truetype(FONT_PATH_BOLD, 22)
        font_mono = ImageFont.truetype(FONT_PATH_BOLD, 20)

        # Header bar
        draw.rectangle([0, 0, width, 80], fill=(15, 118, 110))
        draw.text((40, 20), "AutoElektronik — Лаборатория за Ремонт на ABS Модули", fill=(255, 255, 255), font=font_title)

        # Timeline indicator
        progress_w = int((f / total_frames) * width)
        draw.rectangle([0, 80, progress_w, 86], fill=(45, 212, 191))

        # Different stages based on timestamp
        if t < 2.0:
            # Stage 1: Initial Diagnosis & Microscopic Inspection
            draw.text((60, 130), "ЕТАП 1: Микроскопска диагностика на керамичната подложка", fill=(45, 212, 191), font=font_title)
            draw.text((60, 190), "Модул: ATE MK60 / ESP (VAG / BMW / Ford / Opel)", fill=(203, 213, 225), font=font_sub)
            draw.text((60, 230), "Регистриран код за грешка: 01276 — Хидравлична помпа V64 (Signal Implausible)", fill=(248, 113, 113), font=font_sub)

            # Simulated microscope view circle
            cx, cy, radius = 880, 420, 180
            draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(2, 6, 23), outline=(45, 212, 191), width=4)
            # Crosshairs
            draw.line([cx - radius, cy, cx + radius, cy], fill=(51, 65, 85), width=1)
            draw.line([cx, cy - radius, cx, cy + radius], fill=(51, 65, 85), width=1)

            # Draw fractured bond wire under microscope
            draw.line([cx - 90, cy + 40, cx - 20, cy], fill=(234, 179, 8), width=5)
            # Break point pulsing
            pulse = int(128 + 127 * math.sin(t * 10))
            draw.ellipse([cx - 25, cy - 5, cx - 15, cy + 5], fill=(255, 60, 60, pulse))
            draw.text((cx - 80, cy - 60), "[!] ПРЕКЪСНАТ БОНДИНГ ПРОВОДНИК", fill=(239, 68, 68), font=font_mono)

        elif t < 4.0:
            # Stage 2: Ultrasonic Microbonding Procedure
            draw.text((60, 130), "ЕТАП 2: Ултразвуково микрозапояване по стандарт IPC-7711", fill=(45, 212, 191), font=font_title)
            draw.text((60, 190), "Подмяна с подсилени златни/алуминиеви нишки с дебелина 35 микрона", fill=(203, 213, 225), font=font_sub)

            # Simulated oscilloscope screen
            draw.rounded_rectangle([60, 260, 620, 620], radius=16, fill=(2, 6, 23), outline=(51, 65, 85), width=2)
            draw.text((80, 280), "ОСЦИЛОСКОП: Сигнал на CAN-Bus шина & Датчик G201", fill=(148, 163, 184), font=font_mono)

            # Oscilloscope grid
            for gx in range(80, 600, 50):
                draw.line([gx, 320, gx, 580], fill=(15, 23, 42), width=1)
            for gy in range(320, 600, 50):
                draw.line([80, gy, 600, gy], fill=(15, 23, 42), width=1)

            # Animated CAN-Bus square wave
            wave_pts = []
            for wx in range(80, 600, 4):
                phase = (wx * 0.05) - (t * 15)
                wy = 450 - int(50 * (1 if math.sin(phase) > 0 else -1))
                wave_pts.append((wx, wy))
            if len(wave_pts) > 1:
                draw.line(wave_pts, fill=(34, 197, 94), width=3)

            # Microbonding tool visual
            bx, by = 900, 440
            draw.rounded_rectangle([700, 260, 1200, 620], radius=16, fill=(15, 23, 42), outline=(45, 212, 191), width=2)
            draw.text((730, 290), "ТЕХНОЛОГИЧНА КЛЕТКА ЗА МИКРОЗАПОЯВАНЕ", fill=(241, 245, 249), font=font_status)
            draw.text((730, 340), "• Честота на ултразвук: 60 kHz", fill=(203, 213, 225), font=font_sub)
            draw.text((730, 380), "• Температурен профил: 180°C азотна среда", fill=(203, 213, 225), font=font_sub)
            draw.text((730, 420), "• Устойчивост на опън: > 12 грама", fill=(203, 213, 225), font=font_sub)
            draw.text((730, 490), "СТАТУС: ВЪЗСТАНОВЯВАНЕ В ПРОЦЕС...", fill=(234, 179, 8), font=font_title)

        else:
            # Stage 3: Automated Test Bench & Quality Pass
            draw.text((60, 130), "ЕТАП 3: Финално тестване на хидравличен стенд", fill=(45, 212, 191), font=font_title)
            draw.text((60, 190), "Проверка на соленоидни клапани, мотор на помпата и G201 датчик", fill=(203, 213, 225), font=font_sub)

            # Big Quality PASS Card
            draw.rounded_rectangle([60, 260, 1220, 620], radius=18, fill=(6, 78, 59), outline=(34, 197, 94), width=3)
            draw.text((120, 310), "✓ ТЕСТЪТ ПРЕМИНА УСПЕШНО (DIAGNOSTIC TEST PASS)", fill=(240, 253, 244), font=font_title)
            draw.text((120, 380), "• Хидравлична помпа V64: 100% изправност (Консумация: 1.8A)", fill=(220, 252, 231), font=font_sub)
            draw.text((120, 420), "• Датчик налягане G201: Калибриран на 0.00 bar (Точност 99.8%)", fill=(220, 252, 231), font=font_sub)
            draw.text((120, 460), "• CAN-Bus комуникация: Стабилен отговор, 0 записани грешки", fill=(220, 252, 231), font=font_sub)
            draw.text((120, 520), "ИЗДАДЕНА 12 МЕСЕЦА ПЪЛНА ПИСМЕНА ГАРАНЦИЯ — AutoElektronik", fill=(254, 240, 138), font=font_status)

        # Convert PIL back to OpenCV BGR for writing
        frame_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        out.write(frame_bgr)

    out.release()
    print(f"Generated {out_path} ({os.path.getsize(out_path)} bytes, {total_frames} frames)")

if __name__ == "__main__":
    generate_apple_touch_icon()
    generate_social_share()
    generate_mp4_video()
