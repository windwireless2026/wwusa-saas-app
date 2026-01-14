import json

files = [
    (r'D:\dev\wwusa-saas-app\src\messages\pt.json', {'responsible': 'Responsável', 'date': 'Data'}),
    (r'D:\dev\wwusa-saas-app\src\messages\en.json', {'responsible': 'Responsible', 'date': 'Date'}),
    (r'D:\dev\wwusa-saas-app\src\messages\es.json', {'responsible': 'Responsável', 'date': 'Fecha'})
]

for file_path, new_keys in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'Dashboard' in data and 'Inventory' in data['Dashboard'] and 'table' in data['Dashboard']['Inventory']:
        data['Dashboard']['Inventory']['table'].update(new_keys)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

print("✅ Updated translations with Responsible and Date columns")
