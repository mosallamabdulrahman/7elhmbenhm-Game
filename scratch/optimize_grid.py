from PIL import Image
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size
arr = np.array(img)

# Button brightness mask
is_white = (arr[:, :, 0] > 215) & (arr[:, :, 1] > 215) & (arr[:, :, 2] > 215)

# Let's test a few variations of gx1, gy1, gx2, gy2 to find maximum overlap with white buttons!
best_score = 0
best_params = None

for gx1 in range(460, 485, 4):
    for gy1 in range(275, 295, 4):
        for gx2 in range(1195, 1215, 4):
            for gy2 in range(845, 865, 4):
                gw = gx2 - gx1
                gh = gy2 - gy1
                # sample centers of the 30 cells
                score = 0
                for r in range(6):
                    for c in range(5):
                        cx = int(gx1 + (c + 0.5) * (gw / 5))
                        cy = int(gy1 + (r + 0.5) * (gh / 6))
                        # inside white button face
                        if is_white[cy, cx]:
                            score += 1
                if score > best_score:
                    best_score = score
                    best_params = (gx1, gy1, gx2, gy2)

print(f"Best score: {best_score}/30 with params: {best_params}")
if best_params:
    gx1, gy1, gx2, gy2 = best_params
    gw, gh = gx2 - gx1, gy2 - gy1
    print(f"Optimal grid: left={gx1/w*100:.2f}%, top={gy1/h*100:.2f}%, width={gw/w*100:.2f}%, height={gh/h*100:.2f}%")
