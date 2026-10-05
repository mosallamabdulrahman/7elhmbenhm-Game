import os
from PIL import Image

img = Image.open('public/images/room-background.png')
w, h = img.size
print(f"Dimensions: {w} x {h}")

# Let's crop and check regions
# Left pod: around x from 50 to 500, y from 150 to 500
# Right pod: around x from 1150 to 1600, y from 150 to 500
# Center grid: around x from 450 to 1220, y from 250 to 880

# Let's inspect pixel colors around Team 1 name banner
# Let's save crops to scratch to check
os.makedirs('scratch', exist_ok=True)

# Left pod banner
crop_team1_name = img.crop((int(w * 0.04), int(h * 0.20), int(w * 0.28), int(h * 0.35)))
crop_team1_name.save('scratch/team1_name_crop.png')

# Left pod score
crop_team1_score = img.crop((int(w * 0.04), int(h * 0.33), int(w * 0.28), int(h * 0.46)))
crop_team1_score.save('scratch/team1_score_crop.png')

# Right pod banner
crop_team2_name = img.crop((int(w * 0.72), int(h * 0.20), int(w * 0.96), int(h * 0.35)))
crop_team2_name.save('scratch/team2_name_crop.png')

# Right pod score
crop_team2_score = img.crop((int(w * 0.72), int(h * 0.33), int(w * 0.96), int(h * 0.46)))
crop_team2_score.save('scratch/team2_score_crop.png')

# Center grid
crop_center_grid = img.crop((int(w * 0.26), int(h * 0.26), int(w * 0.74), int(h * 0.90)))
crop_center_grid.save('scratch/center_grid_crop.png')

print("Crops saved successfully!")
