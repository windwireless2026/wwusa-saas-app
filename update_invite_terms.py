import json

files = [
    (r'D:\dev\wwusa-saas-app\src\messages\pt.json', {
        'Users': {
            'newButton': 'Convidar Usuário',
            'modal': {
                'titleNew': 'Convidar Novo Usuário',
                'save': 'Enviar Convite'
            }
        }
    }),
    (r'D:\dev\wwusa-saas-app\src\messages\en.json', {
        'Users': {
            'newButton': 'Invite User',
            'modal': {
                'titleNew': 'Invite New User',
                'save': 'Send Invitation'
            }
        }
    }),
    (r'D:\dev\wwusa-saas-app\src\messages\es.json', {
        'Users': {
            'newButton': 'Invitar Usuario',
            'modal': {
                'titleNew': 'Invitar Nuevo Usuario',
                'save': 'Enviar Invitación'
            }
        }
    })
]

for file_path, updates in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'Dashboard' in data and 'Users' in data['Dashboard']:
        # Update deep keys
        if 'newButton' in updates['Users']:
            data['Dashboard']['Users']['newButton'] = updates['Users']['newButton']
        
        if 'modal' in updates['Users']:
            data['Dashboard']['Users']['modal'].update(updates['Users']['modal'])
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

print("✅ Updated translations to use 'Invite' terminology")
