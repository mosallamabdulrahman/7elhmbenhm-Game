from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
arr = np.array(img)

# Let's find each button in the 5x6 grid
# The grid is from x=436 to 1234, y=250 to 867
# Let's slice into 5 column regions and 6 row regions
xs = np.linspace(436, 1234, 6)
ys = np.linspace(250, 867, 7)

print("Grid slices:")
print("Cols:", xs)
print("Rows:", ys)

# Let's inspect the buttons in each cell
for r in range(6):
    row_str = []
    for c in range(5):
        x1, x2 = int(xs[c]), int(xs[c+1])
        y1, y2 = int(ys[r]), int(ys[r+1])
        row_str.append(f"({x1},{y1})-({x2},{y2})")
    print(f"Row {r+1}: {row_str[0]} ... {row_str[-1]}")
