import re

with open(r'D:\dev\wwusa-saas-app\src\app\[locale]\dashboard\inventory\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update colSpan
content = content.replace('colSpan={7}', 'colSpan={9}')

# 2. Update Headers
header_pattern = r'''                            <th style={{ \.\.\.tableHeaderStyle, width: '10%' }}>
                                \{t\('table\.price'\)\}
                            </th>
                            <th style={{ \.\.\.tableHeaderStyle, width: '10%' }}>
                                \{t\('table\.status'\)\}
                                <select value=\{filterStatus\} onChange=\{e => setFilterStatus\(e\.target\.value\)\} style=\{filterSelectStyle\}>
                                    <option value="">Todos</option>
                                    \{allStatuses\.map\(s => <option key=\{s\} value=\{s\}>\{s\}</option>\)\}
                                </select>
                            </th>
                            <th style={{ \.\.\.tableHeaderStyle, width: '15%', textAlign: 'right' }}>
                                <div style={{ marginBottom: '28px' }}>\{t\('table\.actions'\)\}</div>
                            </th>'''

new_headers = '''                            <th style={{ ...tableHeaderStyle, width: '8%' }}>
                                {t('table.price')}
                            </th>
                            <th style={{ ...tableHeaderStyle, width: '10%' }}>
                                {t('table.status')}
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={filterSelectStyle}>
                                    <option value="">Todos</option>
                                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </th>
                            <th style={{ ...tableHeaderStyle, width: '10%' }}>
                                {t('table.responsible')}
                            </th>
                            <th style={{ ...tableHeaderStyle, width: '10%' }}>
                                {t('table.date')}
                            </th>
                            <th style={{ ...tableHeaderStyle, width: '10%', textAlign: 'right' }}>
                                <div style={{ marginBottom: '28px' }}>{t('table.actions')}</div>
                            </th>'''

content = re.sub(header_pattern, new_headers, content, flags=re.MULTILINE)

# 3. Update Row Cells
# We need to find where the status td ends and add the two new tds
row_pattern = r'''                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: item\.status === 'Available' \? '#10b981' :
                                                            item\.status === 'Sold' \? '#ef4444' :
                                                            item\.status === 'Reserved' \? '#f59e0b' : '#64748b'
                                            }} />
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: item\.status === 'Available' \? '#059669' :
                                                       item\.status === 'Sold' \? '#dc2626' :
                                                       item\.status === 'Reserved' \? '#d97706' : '#475569'
                                            }}>
                                                \{item\.status\}
                                            </span>
                                        </div>
                                    </td>'''

new_row_cells = r'''                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: item.status === 'Available' ? '#10b981' :
                                                            item.status === 'Sold' ? '#ef4444' :
                                                            item.status === 'Reserved' ? '#f59e0b' : '#64748b'
                                            }} />
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: item.status === 'Available' ? '#059669' :
                                                       item.status === 'Sold' ? '#dc2626' :
                                                       item.status === 'Reserved' ? '#d97706' : '#475569'
                                            }}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>
                                        {item.creator?.full_name || '---'}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px' }}>
                                        {new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </td>'''

content = re.sub(row_pattern, new_row_cells, content, flags=re.MULTILINE)

# 4. Fix Lint Errors: 'warning' -> 'info' (as per IDE feedback)
content = content.replace("'warning'", "'info'")

with open(r'D:\dev\wwusa-saas-app\src\app\[locale]\dashboard\inventory\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated inventory table UI and fixed lint errors")
