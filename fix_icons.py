import os
import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace FontAwesome link with Lucide script
    content = content.replace(
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
        '<script src="https://unpkg.com/lucide@latest"></script>'
    )
    
    with open(file, 'w') as f:
        f.write(content)
print("Updated HTML files.")
