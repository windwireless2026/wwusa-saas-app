#!/usr/bin/env python3
"""
Script para garantir que todas as páginas do dashboard tenham padding consistente de 40px
"""

import os
import re

DASHBOARD_DIR = r'd:\dev\wwusa-saas-app\src\app\[locale]\dashboard'

def fix_padding(file_path):
    """Corrige o padding em um arquivo page.tsx"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Padrões problemáticos a corrigir
        # 1. padding: '0' -> padding: '40px'
        content = re.sub(r"padding:\s*'0'", "padding: '40px'", content)
        
        # 2. padding: '32px' -> padding: '40px' (padronizar)
        content = re.sub(r"padding:\s*'32px'", "padding: '40px'", content)
        
        # 3. Sem padding explícito no container principal
        # Procurar por: <div style={{ ... }}> logo após return (
        # (Este é mais complexo e requer análise caso a caso)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Corrigido: {file_path}")
            return True
        else:
            print(f"⏭️  Sem alterações: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Erro em {file_path}: {e}")
        return False

def scan_dashboard_pages():
    """Escaneia todas as páginas do dashboard"""
    fixed_count = 0
    
    for root, dirs, files in os.walk(DASHBOARD_DIR):
        for file in files:
            if file == 'page.tsx':
                file_path = os.path.join(root, file)
                if fix_padding(file_path):
                    fixed_count += 1
    
    print(f"\n📊 Total de páginas corrigidas: {fixed_count}")

if __name__ == '__main__':
    print("🔧 Iniciando correção de padding nas páginas do dashboard...\n")
    scan_dashboard_pages()
    print("\n✅ Concluído!")
