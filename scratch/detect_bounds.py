from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size
arr = np.array(img)

# Find white buttons: buttons are mostly white/light blue (> 200 in R, G, B)
# in the center region: x between 0.25*w and 0.75*w, y between 0.25*h and 0.95*h
center_x1, center_x2 = int(w * 0.25), int(w * 0.75)
center_y1, center_y2 = int(h * 0.25), int(h * 0.95)

crop = arr[center_y1:center_y2, center_x1:center_x2]
# Button face color is very high brightness (e.g. > 220)
is_white = (crop[:, :, 0] > 220) & (crop[:, :, 1] > 220) & (crop[:, :, 2] > 220)

# Let's project on x and y to find the grid bounds
col_counts = np.sum(is_white, axis=0)
row_counts = np.sum(is_white, axis=1)

active_cols = np.where(col_counts > 20)[0]
active_rows = np.where(row_counts > 20)[0]

grid_left = center_x1 + active_cols[0]
grid_right = center_x1 + active_cols[-1]
grid_top = center_y1 + active_rows[0]
grid_bottom = center_y1 + active_rows[-1]

print(f"Center Grid Bounds: left={grid_left} ({grid_left/w*100:.2f}%), right={grid_right} ({grid_right/w*100:.2f}%), top={grid_top} ({grid_top/h*100:.2f}%), bottom={grid_bottom} ({grid_bottom/h*100:.2f}%)")
print(f"Grid Width = {grid_right - grid_left} ({(grid_right - grid_left)/w*100:.2f}%), Height = {grid_bottom - grid_top} ({(grid_bottom - grid_top)/h*100:.2f}%)")

# Let's check team banners:
# Team 1 Name is the dark blue box in left pod
# Let's find the blue box in left pod (x in 0.04 to 0.28, y in 0.20 to 0.35)
# In team 1 name crop:
print("\nChecking Team 1 & Team 2 banners:")
# Let's check exact pixels of text / banner
# Let's save a visual overlay with rectangle drawn on public/images/room-background.png to verify!
from PIL import ImageDraw

debug_img = img.copy()
draw = ImageDraw.Draw(debug_img)
draw.rectangle([grid_left, grid_top, grid_right, grid_bottom], outline="red", width=3)
debug_img.save('scratch/debug_grid_overlay.png')
print("Saved debug_grid_overlay.png")
