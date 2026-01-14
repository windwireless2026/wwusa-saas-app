with open(r'D:\dev\wwusa-saas-app\src\components\dashboard\Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add back the text label
content = content.replace(
    '                />',
    '''                />
                {!isCollapsed && (
                    <span style={{ fontSize: '18px', fontWeight: '850', color: '#1e293b', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                        WIND WIRELESS
                    </span>
                )}'''
)

with open(r'D:\dev\wwusa-saas-app\src\components\dashboard\Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added WIND WIRELESS text back!")
