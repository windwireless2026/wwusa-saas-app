import re

with open(r'D:\dev\wwusa-saas-app\src\app\[locale]\dashboard\inventory\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the handleFileUpload function
old_function = r'''    const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{
        const file = e\.target\.files\?\.\[0\];
        if \(file\) \{
            setIsImporting\(true\);
            setTimeout\(async \(\) => \{
                setIsImporting\(false\);
                await alert\('Processamento', `Arquivo "\$\{file\.name\}" processado simuladamente\.`, 'info'\);
            \}, 2000\);
        \}
    \};'''

new_function = '''    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsImporting(true);
        
        try {
            const result = await processInventoryFile(file, alert);
            
            if (result.errors.length > 0) {
                await alert(
                    'Importação Parcial',
                    `${result.success} items importados com sucesso.\\n\\nErros encontrados:\\n${result.errors.slice(0, 5).join('\\n')}${result.errors.length > 5 ? `\\n... e mais ${result.errors.length - 5} erros` : ''}`,
                    'warning'
                );
            } else {
                await alert(
                    'Sucesso!',
                    `${result.success} items importados com sucesso!`,
                    'success'
                );
            }
            
            await fetchInventory();
        } catch (error: any) {
            await alert('Erro', error.message || 'Erro ao processar planilha', 'danger');
        } finally {
            setIsImporting(false);
            e.target.value = ''; // Reset file input
        }
    };'''

content = re.sub(old_function, new_function, content, flags=re.DOTALL)

with open(r'D:\dev\wwusa-saas-app\src\app\[locale]\dashboard\inventory\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated handleFileUpload!")
