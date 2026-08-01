with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Calendar Controls" in line:
        print(f"Calendar Controls at line {i+1}")
        # Insert the closing parenthesis before the Calendar Controls if it belongs outside?
        # Actually, let's look at lines around Calendar Controls
        print("".join(lines[i-15:i+5]))
        break
