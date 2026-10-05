from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size
arr = np.array(img)

# Let's inspect the white button 1 at row 0, col 0
# Bounding region around (436, 250) to (595, 352)
c1 = arr[250:353, 436:596]
is_btn = (c1[:, :, 0] > 200) & (c1[:, :, 1] > 200) & (c1[:, :, 2] > 200)

rows = np.where(np.sum(is_btn, axis=1) > 10)[0]
cols = np.where(np.sum(is_btn, axis=0) > 10)[0]

print(f"Button 1 in cell: y from {rows[0]} to {rows[-1]} (h={rows[-1]-rows[0]}), x from {cols[0]} to {cols[-1]} (w={cols[-1]-cols[0]})")
print(f"Cell size: {c1.shape[1]}x{c1.shape[0]}")
print(f"Button width / cell width = {(cols[-1]-cols[0])/c1.shape[1]:.2f}")
print(f"Button height / cell height = {(rows[-1]-rows[0])/c1.shape[0]:.2f}")

# Also let's check gap between button 1 and button 2
c2 = arr[250:353, 596:756]
is_btn2 = (c2[:, :, 0] > 200) & (c2[:, :, 1] > 200) & (c2[:, :, 2] > 200)
cols2 = np.where(np.sum(is_btn2, axis=0) > 10)[0]
btn1_right = 436 + cols[-1]
btn2_left = 596 + cols2[0]
print(f"Gap between button 1 and 2: {btn2_left - btn1_right}px ({(btn2_left - btn1_right)/w*100:.2f}%)")
