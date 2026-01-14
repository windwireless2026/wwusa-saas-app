with open(r'D:\dev\wwusa-saas-app\src\components\dashboard\Sidebar.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace line 152
for i in range(len(lines)):
    if i == 151:  # Line 152 (0-indexed)
        lines[i] = '''                <img 
                    src="/images/wind_wireless.png" 
                    alt="WindSystem Logo"
                    style={{
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '11px',
                        objectFit: 'contain',
                        background: 'white',
                        padding: '4px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                />
                {!isCollapsed && (
                    <span style={{ fontSize: '18px', fontWeight: '850', color: '#1e293b', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                        WIND WIRELESS
                    </span>
                )}
'''
        # Remove lines 153-157 (they are part of the old code)
        del lines[152:157]
        break

with open(r'D:\dev\wwusa-saas-app\src\components\dashboard\Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Fixed logo successfully!")
