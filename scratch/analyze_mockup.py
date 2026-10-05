from PIL import Image

im = Image.open(r'C:\Users\Abdulrahman\.gemini\antigravity-ide\brain\f4e50d01-13d3-4cb0-a564-e53920a421f5\.user_uploaded\media_1791238456463.jpg').convert('RGB')
w, h = im.size
print(f"Mockup size: {w}x{h}")

# The buttons are white (r>200, g>200, b>200)
# Let's find bounding box of all white buttons in center area
white_pixels = []
for y in range(int(h * 0.1), int(h * 0.98)):
    for x in range(int(w * 0.25), int(w * 0.75)):
        r, g, b = im.getpixel((x, y))
        if r > 210 and g > 210 and b > 210:
            white_pixels.append((x, y))

if white_pixels:
    min_x = min(p[0] for p in white_pixels)
    max_x = max(p[0] for p in white_pixels)
    min_y = min(p[1] for p in white_pixels)
    max_y = max(p[1] for p in white_pixels)
    print(f"Buttons Grid Bounding Box:")
    print(f"X: {min_x} to {max_x} ({min_x/w*100:.2f}% to {max_x/w*100:.2f}%), Width: {(max_x - min_x)/w*100:.2f}%")
    print(f"Y: {min_y} to {max_y} ({min_y/h*100:.2f}% to {max_y/h*100:.2f}%), Height: {(max_y - min_y)/h*100:.2f}%")

# Let's inspect Team 1 text ("الفريق الأول")
team1_pixels = []
for y in range(int(h * 0.15), int(h * 0.35)):
    for x in range(int(w * 0.05), int(w * 0.30)):
        r, g, b = im.getpixel((x, y))
        if r > 200 and g > 200 and b > 200: # White text
            team1_pixels.append((x, y))

if team1_pixels:
    print(f"\nTeam 1 Name Text: X: {min(p[0] for p in team1_pixels)/w*100:.2f}% to {max(p[0] for p in team1_pixels)/w*100:.2f}%, Y: {min(p[1] for p in team1_pixels)/h*100:.2f}% to {max(p[1] for p in team1_pixels)/h*100:.2f}%")

# Team 1 Score (0)
t1_score_pixels = []
for y in range(int(h * 0.34), int(h * 0.45)):
    for x in range(int(w * 0.05), int(w * 0.30)):
        r, g, b = im.getpixel((x, y))
        if r > 200 and g > 200 and b > 200:
            t1_score_pixels.append((x, y))

if t1_score_pixels:
    print(f"Team 1 Score Text: X: {min(p[0] for p in t1_score_pixels)/w*100:.2f}% to {max(p[0] for p in t1_score_pixels)/w*100:.2f}%, Y: {min(p[1] for p in t1_score_pixels)/h*100:.2f}% to {max(p[1] for p in t1_score_pixels)/h*100:.2f}%")

# Team 2 Name text
team2_pixels = []
for y in range(int(h * 0.15), int(h * 0.35)):
    for x in range(int(w * 0.70), int(w * 0.95)):
        r, g, b = im.getpixel((x, y))
        if r > 200 and g > 200 and b > 200:
            team2_pixels.append((x, y))

if team2_pixels:
    print(f"\nTeam 2 Name Text: X: {min(p[0] for p in team2_pixels)/w*100:.2f}% to {max(p[0] for p in team2_pixels)/w*100:.2f}%, Y: {min(p[1] for p in team2_pixels)/h*100:.2f}% to {max(p[1] for p in team2_pixels)/h*100:.2f}%")

# Team 2 Score
t2_score_pixels = []
for y in range(int(h * 0.34), int(h * 0.45)):
    for x in range(int(w * 0.70), int(w * 0.95)):
        r, g, b = im.getpixel((x, y))
        if r > 200 and g > 200 and b > 200:
            t2_score_pixels.append((x, y))

if t2_score_pixels:
    print(f"Team 2 Score Text: X: {min(p[0] for p in t2_score_pixels)/w*100:.2f}% to {max(p[0] for p in t2_score_pixels)/w*100:.2f}%, Y: {min(p[1] for p in t2_score_pixels)/h*100:.2f}% to {max(p[1] for p in t2_score_pixels)/h*100:.2f}%")
