
import os

def replace_in_file(filepath, old_str, new_str):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_str in content:
            new_content = content.replace(old_str, new_str)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    root_dir = r"d:/Printing Price Pro/3D Print Price Calculator"
    # Target specific patterns to avoid over-matching
    replacements = [
        (" * 3D Print Price Calculator", " * PolymagicPrice"),
        ("3d-print-price-calculator", "polymagicprice") # For package-lock.json maybe? Be careful.
    ]
    
    extensions = {'.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.md', '.json'}
    
    count = 0
    for subdir, dirs, files in os.walk(root_dir):
        if 'node_modules' in subdir or '.git' in subdir or 'dist' in subdir:
            continue
            
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in extensions:
                filepath = os.path.join(subdir, file)
                for old, new in replacements:
                    if replace_in_file(filepath, old, new):
                        count += 1
                        break # Move to next file after one replacement type to avoid double hits if needed, but here parallel is fine.
                        
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    main()
