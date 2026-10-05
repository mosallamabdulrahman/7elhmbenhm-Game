from PIL import Image

im = Image.open('public/images/room-background.png').convert('RGB')
w, h = im.size

# Left Pod horizontal scan at y=260 (upper name box)
xs_left_name = []
for x in range(30, 600):
    r, g, b = im.getpixel((x, 260))
    # Look for blue box color
    if b > 90 and r < 30 and g > 30:
        xs_left_name.append(x)
print(f"Left Pod Name Box X: {min(xs_left_name)} to {max(xs_left_name)} ({min(xs_left_name)/w*100:.2f}% to {max(xs_left_name)/w*100:.2f}%)")

# Left Pod Score box at y=375
xs_left_score = []
for x in range(30, 600):
    r, g, b = im.getpixel((x, 375))
    if b > 50 and r < 20 and g < 50:
        xs_left_score.append(x)
print(f"Left Pod Score Box X: {min(xs_left_score)} to {max(xs_left_score)} ({min(xs_left_score)/w*100:.2f}% to {max(xs_left_score)/w*100:.2f}%)")

# Right Pod horizontal scan at y=260 (upper name box)
xs_right_name = []
for x in range(1000, 1650):
    r, g, b = im.getpixel((x, 260))
    # Look for green box color
    if g > 50 and r < 20 and b < 40:
        xs_right_name.append(x)
print(f"Right Pod Name Box X: {min(xs_right_name)} to {max(xs_right_name)} ({min(xs_right_name)/w*100:.2f}% to {max(xs_right_name)/w*100:.2f}%)")

# Right Pod Score box at y=375
xs_right_score = []
for x in range(1000, 1650):
    r, g, b = im.getpixel((x, 375))
    if g > 40 and r < 20 and b < 40:
        xs_right_score.append(x)
print(f"Right Pod Score Box X: {min(xs_right_score)} to {max(xs_right_score)} ({min(xs_right_score)/w*100:.2f}% to {max(xs_right_score)/w*100:.2f}%)")

# Now let's look at the center grid in the reference image (the user's first uploaded image with the buttons)!
ref_im = Image.open('public/images/room-background.png') # wait, let's check the user's reference image
