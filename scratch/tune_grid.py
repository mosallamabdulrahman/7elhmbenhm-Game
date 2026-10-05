from PIL import Image, ImageDraw

img = Image.open('public/images/room-background.png')
w, h = img.size

# Let's test a fine-tuned grid bounding box:
# In the image, the outer frame is around (425, 235) to (1247, 885).
# The inner button grid area starts inside the frame:
# Left of button 1: around 472px
# Right of button 5: around 1200px
# Top of button 1: around 284px
# Bottom of button 26-30: around 854px

# Let's test grid bounds:
gx1, gy1, gx2, gy2 = 470, 282, 1202, 856
gw = gx2 - gx1
gh = gy2 - gy1

debug_img = img.copy()
draw = ImageDraw.Draw(debug_img)

# Draw overall grid
draw.rectangle([gx1, gy1, gx2, gy2], outline="red", width=2)

# 5 cols x 6 rows
for r in range(6):
    for c in range(5):
        bx1 = gx1 + c * (gw / 5)
        bx2 = gx1 + (c + 1) * (gw / 5)
        by1 = gy1 + r * (gh / 6)
        by2 = gy1 + (r + 1) * (gh / 6)
        
        # Add 6px margin to simulate button inside cell
        draw.rectangle([bx1 + 8, by1 + 6, bx2 - 8, by2 - 6], outline="cyan", width=2)

debug_img.save('scratch/debug_tuned_buttons.png')
print("Tuned grid bounds:")
print(f"left: {gx1/w*100:.2f}%, top: {gy1/h*100:.2f}%, width: {gw/w*100:.2f}%, height: {gh/h*100:.2f}%")
