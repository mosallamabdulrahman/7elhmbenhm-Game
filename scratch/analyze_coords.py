from PIL import Image

im = Image.open('public/images/room-background.png').convert('RGB')
w, h = im.size

# Let's inspect along key lines
# Center area at y = 500: find where the inner dark frame starts and ends
# Center frame has a border. Let's find the inner dark blue area.
center_y = int(h * 0.55)
xs_dark = []
for x in range(int(w * 0.2), int(w * 0.8)):
    r, g, b = im.getpixel((x, center_y))
    # Dark blue interior has low brightness
    if r < 30 and g < 50 and b < 80:
        xs_dark.append(x)

if xs_dark:
    print(f"Center board X: {min(xs_dark)} to {max(xs_dark)} ({min(xs_dark)/w*100:.2f}% to {max(xs_dark)/w*100:.2f}%)")

center_x = int(w * 0.5)
ys_dark = []
for y in range(int(h * 0.2), int(h * 0.95)):
    r, g, b = im.getpixel((center_x, y))
    if r < 30 and g < 50 and b < 80:
        ys_dark.append(y)

if ys_dark:
    print(f"Center board Y: {min(ys_dark)} to {max(ys_dark)} ({min(ys_dark)/h*100:.2f}% to {max(ys_dark)/h*100:.2f}%)")

# Left Pod:
# Top box: y ~ 200..340, x ~ 70..480
# Bottom box: y ~ 340..460, x ~ 70..480
print("\nScanning Left Pod at x=250:")
for y in range(int(h * 0.15), int(h * 0.55), 10):
    r, g, b = im.getpixel((int(w * 0.15), y))
    print(f"y={y} ({y/h*100:.1f}%): ({r},{g},{b})")

# Right Pod:
print("\nScanning Right Pod at x=1400:")
for y in range(int(h * 0.15), int(h * 0.55), 10):
    r, g, b = im.getpixel((int(w * 0.85), y))
    print(f"y={y} ({y/h*100:.1f}%): ({r},{g},{b})")
