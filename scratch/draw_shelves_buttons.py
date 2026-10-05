from PIL import Image, ImageDraw
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size
debug = img.copy()
draw = ImageDraw.Draw(debug)

# Let's adjust the inner grid container to sit precisely on the 6 shelves:
# Inner frame bounds:
# x from 480 to 1190
# y from 285 to 885
gx1, gy1 = 485, 295
gx2, gy2 = 1187, 875
gw = gx2 - gx1
gh = gy2 - gy1

# Team 1 Name & Score
draw.rectangle([80, 224, 442, 330], outline="yellow", width=2)
draw.rectangle([98, 362, 442, 440], outline="cyan", width=2)

# Team 2 Name & Score
draw.rectangle([1230, 224, 1592, 330], outline="yellow", width=2)
draw.rectangle([1230, 362, 1574, 440], outline="cyan", width=2)

# Center 30 buttons:
# 5 columns x 6 rows
for r in range(6):
    for c in range(5):
        cell_x1 = gx1 + c * (gw / 5)
        cell_x2 = gx1 + (c + 1) * (gw / 5)
        cell_y1 = gy1 + r * (gh / 6)
        cell_y2 = gy1 + (r + 1) * (gh / 6)
        
        # White squircle button inside the shelf row
        # button padding: 12px horizontal, 6px vertical
        bx1 = cell_x1 + 12
        bx2 = cell_x2 - 12
        by1 = cell_y1 + 5
        by2 = cell_y2 - 7
        
        draw.rounded_rectangle([bx1, by1, bx2, by2], radius=14, fill=(255, 255, 255, 240), outline=(200, 215, 230), width=2)

debug.save('scratch/debug_buttons_on_shelves.png')
print("Saved debug_buttons_on_shelves.png")
