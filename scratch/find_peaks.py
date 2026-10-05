from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size

# Let's inspect the center frame:
# Frame top-left:
# In the image, the frame is bounded by:
# Left border of white frame: around x=425
# Right border of white frame: around x=1245
# Top border of frame: around y=240
# Bottom border of frame: around y=880

# Inside this frame, there are 5 columns of buttons and 6 rows.
# Let's find the centers of the text numbers (1..30) which are dark navy (#0B2D4D or similar dark color)
arr = np.array(img)
# Dark pixels inside grid (x: 430..1240, y: 250..870)
# Dark pixels have R < 60, G < 60, B < 80
grid_crop = arr[250:880, 430:1240]
dark = (grid_crop[:, :, 0] < 60) & (grid_crop[:, :, 1] < 60) & (grid_crop[:, :, 2] < 90)

# Let's project dark pixels on x and y
x_proj = np.sum(dark, axis=0)
y_proj = np.sum(dark, axis=1)

# Find peaks in x_proj (5 peaks) and y_proj (6 peaks)
from scipy.signal import find_peaks
import scipy.signal

# Let's print peaks if scipy is available or do simple peak finding
try:
    x_peaks, _ = scipy.signal.find_peaks(x_proj, distance=100, height=20)
    y_peaks, _ = scipy.signal.find_peaks(y_proj, distance=60, height=20)
    print("X peaks (col centers):", [430 + p for p in x_peaks])
    print("Y peaks (row centers):", [250 + p for p in y_peaks])
except Exception as e:
    print("scipy error:", e)
