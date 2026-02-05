#!/usr/bin/env python3
"""
Script para aplicar PageHeader unificado em todas as páginas pendentes do dashboard
"""

import os
import re

# Mapeamento de páginas e suas configurações
PAGES_CONFIG = {
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/cost-centers/page.tsx': {
        'title': 'Centros de Custo',
        'description': 'Gestão de centros de custo financeiros',
        'icon': '💼',
        'breadcrumbs': [
            {'label': 'FINANCEIRO', 'href': '/dashboard/financas', 'color': '#059669'},
            {'label': 'CONFIGURAÇÕES', 'color': '#059669'},
            {'label': 'CENTROS DE CUSTO', 'color': '#059669'},
        ],
        'color': '#059669'
    },
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/users/page.tsx': {
        'title': 'Usuários',
        'description': 'Gestão de usuários e permissões',
        'icon': '👤',
        'breadcrumbs': [
            {'label': 'SEGURANÇA', 'href': '/dashboard/security', 'color': '#dc2626'},
            {'label': 'USUÁRIOS', 'color': '#dc2626'},
        ],
        'color': '#dc2626'
    },
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/agents/page.tsx': {
        'title': 'Agentes',
        'description': 'Gestão de fornecedores, clientes e parceiros',
        'icon': '🤝',
        'breadcrumbs': [
            {'label': 'CADASTRO', 'href': '/dashboard/registration', 'color': '#2563eb'},
            {'label': 'AGENTES', 'color': '#2563eb'},
        ],
        'color': '#2563eb'
    },
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/product-types/page.tsx': {
        'title': 'Tipos de Produto',
        'description': 'Categorias e métodos de rastreamento',
        'icon': '🏷️',
        'breadcrumbs': [
            {'label': 'OPERAÇÕES', 'href': '/dashboard/operations', 'color': '#7c3aed'},
            {'label': 'CONFIGURAÇÕES', 'color': '#7c3aed'},
            {'label': 'TIPOS DE PRODUTO', 'color': '#7c3aed'},
        ],
        'color': '#7c3aed'
    },
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/manufacturers/page.tsx': {
        'title': 'Fabricantes',
        'description': 'Gestão de marcas e fabricantes',
        'icon': '🏭',
        'breadcrumbs': [
            {'label': 'OPERAÇÕES', 'href': '/dashboard/operations', 'color': '#7c3aed'},
            {'label': 'CONFIGURAÇÕES', 'color': '#7c3aed'},
            {'label': 'FABRICANTES', 'color': '#7c3aed'},
        ],
        'color': '#7c3aed'
    },
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/models/page.tsx': {
        'title': 'Modelos',
        'description': 'Catálogo de produtos e especificações',
        'icon': '📱',
        'breadcrumbs': [
            {'label': 'OPERAÇÕES', 'href': '/dashboard/operations', 'color': '#7c3aed'},
            {'label': 'CONFIGURAÇÕES', 'color': '#7c3aed'},
            {'label': 'MODELOS', 'color': '#7c3aed'},
        ],
        'color': '#7c3aed'
    },
    'd:/dev/wwusa-saas-app/src/app/[locale]/dashboard/stock-locations/page.tsx': {
        'title': 'Locais de Estoque',
        'description': 'Armazéns e pontos de estoque',
        'icon': '📍',
        'breadcrumbs': [
            {'label': 'OPERAÇÕES', 'href': '/dashboard/operations', 'color': '#7c3aed'},
            {'label': 'CONFIGURAÇÕES', 'color': '#7c3aed'},
            {'label': 'LOCAIS DE ESTOQUE', 'color': '#7c3aed'},
        ],
        'color': '#7c3aed'
    },
}

def apply_pageheader(file_path, config):
    """Aplica o PageHeader em uma página"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Adicionar import do PageHeader se não existir
        if "import PageHeader from '@/components/ui/PageHeader'" not in content:
            # Encontrar a última linha de import
            import_pattern = r"(import .+ from ['\"].*['\"];?\n)"
            imports = list(re.finditer(import_pattern, content))
            if imports:
                last_import = imports[-1]
                insert_pos = last_import.end()
                content = content[:insert_pos] + "import PageHeader from '@/components/ui/PageHeader';\n" + content[insert_pos:]
                print(f"  ✓ Import adicionado")
        
        # 2. Garantir padding correto
        content = re.sub(r"padding:\s*['\"]0['\"]", "padding: '40px'", content)
        content = re.sub(r"padding:\s*['\"]32px['\"]", "padding: '40px'", content)
        
        # 3. Adicionar background se não existir
        if "background: '#f8fafc'" not in content and "minHeight: '100vh'" in content:
            content = re.sub(
                r"(minHeight:\s*['\"]100vh['\"])", 
                r"\1, background: '#f8fafc'",
                content
            )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Atualizado: {os.path.basename(file_path)}")
            return True
        else:
            print(f"⏭️  Já atualizado: {os.path.basename(file_path)}")
            return False
            
    except Exception as e:
        print(f"❌ Erro em {file_path}: {e}")
        return False

def main():
    print("🔧 Aplicando PageHeader unificado em todas as páginas...\n")
    
    updated = 0
    for file_path, config in PAGES_CONFIG.items():
        if os.path.exists(file_path):
            if apply_pageheader(file_path, config):
                updated += 1
        else:
            print(f"⚠️  Arquivo não encontrado: {file_path}")
    
    print(f"\n✅ Concluído! {updated} páginas atualizadas.")

if __name__ == '__main__':
    main()
