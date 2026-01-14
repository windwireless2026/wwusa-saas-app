with open(r'D:\dev\wwusa-saas-app\src\app\[locale]\dashboard\inventory\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The function handleFileUpload starts around line 90
# The problematic if block starts around line 99 and ends around line 109
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'if (result.errors.length > 0)' in line:
        start_idx = i
    if start_idx != -1 and '} else {' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_block = [
        '            if (result.errors.length > 0) {\n',
        '                const errorMsg = `${result.success} items importados com sucesso.\\n\\nErros encontrados:\\n${result.errors.slice(0, 5).join(\'\\n\')}${result.errors.length > 5 ? `\\n... e mais ${result.errors.length - 5} erros` : \'\'}`;\n',
        '                await alert(\'Importação Parcial\', errorMsg, \'warning\');\n',
        '            } else {\n'
    ]
    lines[start_idx:end_idx+1] = new_block
    
    with open(r'D:\dev\wwusa-saas-app\src\app\[locale]\dashboard\inventory\page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("✅ Fixed syntax error successfully!")
else:
    print(f"❌ Could not find block. Start: {start_idx}, End: {end_idx}")
