from PIL import Image, ImageDraw

img = Image.open('public/images/room-background.png')
w, h = img.size
debug = img.copy()
draw = ImageDraw.Draw(debug)

# Refined parameters:
gx1, gy1 = 495, 308
gx2, gy2 = 1175, 878
gw = gx2 - gx1
gh = gy2 - gy1

# 5 cols x 6 rows
for r in range(6):
    for c in range(5):
        cell_x1 = gx1 + c * (gw / 5)
        cell_x2 = gx1 + (c + 1) * (gw / 5)
        cell_y1 = gy1 + r * (gh / 6)
        cell_y2 = gy1 + (r + 1) * (gh / 6)
        
        # In the user's reference image:
        # Buttons are slightly smaller ("صغر المربعات")
        # Horizontal margin: 10px, vertical margin: 6px
        bx1 = cell_x1 + 10
        bx2 = cell_x2 - 10
        by1 = cell_y1 + 5
        by2 = cell_y2 - 6
        
        draw.rounded_rectangle([bx1, by1, bx2, by2], radius=16, fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        # bottom shadow line
        draw.line([bx1 + 4, by2 - 1, bx2 - 4, by2 - 1], fill=(148, 163, 184), width=3)

# Team 1 Name & Score
draw.rounded_rectangle([80, 224, 442, 330], radius=16, fill=(8, 45, 82), outline=(56, 189, 248), width=2)
draw.rounded_rectangle([98, 350, 442, 436], radius=16, fill=(4, 25, 48), outline=(56, 189, 248), width=2)

# Team 2 Name & Score
draw.rounded_rectangle([1230, 224, 1592, 330], radius=16, fill=(10, 56, 18), outline=(74, 222, 128), width=2)
draw.rounded_rectangle([1230, 350, 1574, 436], radius=16, fill=(5, 38, 12), outline=(74, 222, 128), width=2)

debug.save('scratch/debug_buttons_perfect.png')
print(f"Grid: left={gx1/w*100:.2f}%, top={gy1/h*100:.2f}%, width={gw/w*100:.2f}%, height={gh/h*100:.2f}%")
print(f"Team 1 Name: left={80/w*100:.2f}%, top={224/h*100:.2f}%, width={(442-80)/w*100:.2f}%, height={(330-224)/h*100:.2f}%")
print(f"Team 1 Score: left={98/w*100:.2f}%, top={350/h*100:.2f}%, width={(442-98)/w*100:.2f}%, height={(436-350)/h*100:.2f}%")
print(f"Team 2 Name: left={1230/w*100:.2f}%, top={224/h*100:.2f}%, width={(1592-1230)/w*100:.2f}%, height={(330-224)/h*100:.2f}%")
print(f"Team 2 Score: left={1230/w*100:.2f}%, top={350/h*100:.2f}%, width={(1574-1230)/w*100:.2f}%, height={(436-350)/h*100:.2f}%")
