from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
arr = np.array(img)
# Find all pixels with high brightness > 230
white_pts = np.where((arr[:, :, 0] > 230) & (arr[:, :, 1] > 230) & (arr[:, :, 2] > 230))
print("White Y min-max:", white_pts[0].min(), white_pts[0].max())
print("White X min-max:", white_pts[1].min(), white_pts[1].max())

# Let's inspect center vertical strip at x = w // 2 = 836
strip = arr[:, 836]
print("\nVertical strip at x=836:")
for y in range(0, 941, 50):
    print(f"y={y}: RGB={strip[y, :3]}")

# Let's inspect horizontal strip at y = 500
hstrip = arr[500, :]
print("\nHorizontal strip at y=500:")
for x in range(0, 1672, 100):
    print(f"x={x}: RGB={hstrip[x, :3]}")
