from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size
arr = np.array(img)

# Let's inspect the horizontal shelves in center frame (x around 836, y from 250 to 900)
center_col = arr[:, 836]
# In center_col, the shelves are bright cyan/blue lines
# Let's print out the y coordinates where brightness has local peaks
y_peaks = []
for y in range(250, 890):
    # shelf line has higher blue value than the row background
    if arr[y, 836, 2] > 110:
        y_peaks.append(y)

print("Shelf rows / bright lines in y:", y_peaks)

# Let's also inspect the slots in left pod:
# Upper slot (Name): around x=80..420, y=210..320
# Lower slot (Score): around x=100..440, y=340..440
# Let's find dark blue slot boundaries in left pod:
# Slot background is dark blue: R < 10, G < 40, B < 90
crop_pod_left = arr[200:460, 60:460]

# Let's test exact coordinates by drawing them and saving
from PIL import ImageDraw
debug = img.copy()
draw = ImageDraw.Draw(debug)

# Team 1 Name slot:
# In left pod, upper dark recess:
t1_name = [80, 212, 442, 332]
# Lower dark recess:
t1_score = [100, 348, 442, 436]

# Team 2 Name slot (right pod upper):
t2_name = [1230, 212, 1592, 332]
# Lower dark recess:
t2_score = [1230, 348, 1572, 436]

# Center grid inside the frame:
# Frame top inner: y ~ 280, bottom inner: y ~ 860
# Frame left inner: x ~ 460, right inner: x ~ 1210
grid = [460, 280, 1210, 860]

draw.rectangle(t1_name, outline="yellow", width=3)
draw.rectangle(t1_score, outline="cyan", width=3)
draw.rectangle(t2_name, outline="yellow", width=3)
draw.rectangle(t2_score, outline="cyan", width=3)
draw.rectangle(grid, outline="red", width=3)

debug.save('scratch/debug_precise_slots.png')
print("Precise slots overlay saved to scratch/debug_precise_slots.png")
