import re

# Read the file
with open(r'D:\dev\wwusa-saas-app\src\components\dashboard\Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the replacement
old_pattern = r'\{companyLogo \? \(.*?\) : \(.*?\)\}\s+\{!isCollapsed.*?\{companyName\}'
new_content = '''<img 
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
                )}'''

# Replace
content_new = re.sub(old_pattern, new_content, content, flags=re.DOTALL)

# Write back
with open(r'D:\dev\wwusa-saas-app\src\components\dashboard\Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content_new)

print("✅ Logo replaced successfully!")
