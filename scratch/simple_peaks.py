from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size
arr = np.array(img)

grid_crop = arr[250:880, 430:1240]
dark = (grid_crop[:, :, 0] < 80) & (grid_crop[:, :, 1] < 80) & (grid_crop[:, :, 2] < 100)

x_proj = np.sum(dark, axis=0)
y_proj = np.sum(dark, axis=1)

def simple_peaks(signal, min_dist=50, threshold=15):
    peaks = []
    for i in range(1, len(signal)-1):
        if signal[i] > threshold and signal[i] >= signal[i-1] and signal[i] >= signal[i+1]:
            if not peaks or (i - peaks[-1]) >= min_dist:
                peaks.append(i)
            elif signal[i] > signal[peaks[-1]]:
                peaks[-1] = i
    return peaks

x_peaks = simple_peaks(x_proj, min_dist=100, threshold=20)
y_peaks = simple_peaks(y_proj, min_dist=60, threshold=20)

col_centers = [430 + p for p in x_peaks]
row_centers = [250 + p for p in y_peaks]

print("Column centers (px):", col_centers)
print("Column centers (%):", [f"{c/w*100:.2f}%" for c in col_centers])
print("Row centers (px):", row_centers)
print("Row centers (%):", [f"{r/h*100:.2f}%" for r in row_centers])
