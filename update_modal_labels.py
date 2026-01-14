import json

files = [
    (r'D:\dev\wwusa-saas-app\src\messages\pt.json', {
        'Users': {
            'modal': {
                'save': 'Enviar Convite',
                'saveEdit': 'Salvar Alterações'
            }
        }
    }),
    (r'D:\dev\wwusa-saas-app\src\messages\en.json', {
        'Users': {
            'modal': {
                'save': 'Send Invitation',
                'saveEdit': 'Save Changes'
            }
        }
    }),
    (r'D:\dev\wwusa-saas-app\src\messages\es.json', {
        'Users': {
            'modal': {
                'save': 'Enviar Invitación',
                'saveEdit': 'Guardar Cambios'
            }
        }
    })
]

for file_path, updates in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'Dashboard' in data and 'Users' in data['Dashboard'] and 'modal' in data['Dashboard']['Users']:
        data['Dashboard']['Users']['modal'].update(updates['Users']['modal'])
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

print("✅ Updated translations with split Save/Invite labels")
