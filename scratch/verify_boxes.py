from PIL import Image, ImageDraw
import numpy as np

img = Image.open('public/images/room-background.png')
w, h = img.size

# Let's inspect the left pod banner:
# Left pod has blue frame. The name container:
# Around x: 80 to 450, y: 200 to 330
# Score container: around x: 80 to 450, y: 320 to 440

# Let's inspect right pod banner:
# Name container: around x: 1220 to 1590, y: 200 to 330
# Score container: around x: 1220 to 1590, y: 320 to 440

debug_img = img.copy()
draw = ImageDraw.Draw(debug_img)

# Center Grid: left=436, top=250, right=1234, bottom=867
draw.rectangle([436, 250, 1234, 867], outline="red", width=3)

# Let's test team 1 and 2 boxes
# Team 1 Name
t1_name_box = [80, 222, 452, 318]
# Team 1 Score (contains score on left and dots on right)
t1_score_box = [90, 328, 442, 412]

# Team 2 Name
t2_name_box = [1220, 222, 1592, 318]
# Team 2 Score
t2_score_box = [1230, 328, 1582, 412]

draw.rectangle(t1_name_box, outline="yellow", width=2)
draw.rectangle(t1_score_box, outline="cyan", width=2)
draw.rectangle(t2_name_box, outline="yellow", width=2)
draw.rectangle(t2_score_box, outline="cyan", width=2)

debug_img.save('scratch/debug_all_overlays.png')

print(f"Team 1 Name: left={t1_name_box[0]/w*100:.2f}%, top={t1_name_box[1]/h*100:.2f}%, w={(t1_name_box[2]-t1_name_box[0])/w*100:.2f}%, h={(t1_name_box[3]-t1_name_box[1])/h*100:.2f}%")
print(f"Team 1 Score: left={t1_score_box[0]/w*100:.2f}%, top={t1_score_box[1]/h*100:.2f}%, w={(t1_score_box[2]-t1_score_box[0])/w*100:.2f}%, h={(t1_score_box[3]-t1_score_box[1])/h*100:.2f}%")
print(f"Team 2 Name: left={t2_name_box[0]/w*100:.2f}%, top={t2_name_box[1]/h*100:.2f}%, w={(t2_name_box[2]-t2_name_box[0])/w*100:.2f}%, h={(t2_name_box[3]-t2_name_box[1])/h*100:.2f}%")
print(f"Team 2 Score: left={t2_score_box[0]/w*100:.2f}%, top={t2_score_box[1]/h*100:.2f}%, w={(t2_score_box[2]-t2_score_box[0])/w*100:.2f}%, h={(t2_score_box[3]-t2_score_box[1])/h*100:.2f}%")
