'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ColumnFilterProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label: string;
}

export default function ColumnFilter({ options, selected, onChange, label }: ColumnFilterProps) {
    const t = useTranslations('Dashboard.Common');
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleSelectAll = () => {
        if (selected.length === options.length) {
            onChange([]);
        } else {
            onChange([...options]);
        }
    };

    const allSelected = selected.length === options.length;
    const someSelected = selected.length > 0 && selected.length < options.length;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <span>{label}</span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>
                    {someSelected ? '▼' : '▽'}
                </span>
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 99999,
                        minWidth: '200px',
                        maxWidth: '300px',
                        marginTop: '4px',
                    }}
                >
                    {/* Busca */}
                    <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '12px',
                                outline: 'none',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Selecionar Tudo */}
                    <div
                        onClick={handleSelectAll}
                        style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#f8fafc',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                    >
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => { }}
                            style={{ cursor: 'pointer' }}
                        />
                        <span>{t('selectAll')}</span>
                    </div>

                    {/* Lista de opções */}
                    <div
                        style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                        }}
                    >
                        {filteredOptions.length === 0 ? (
                            <div
                                style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                }}
                            >
                                {t('noResults')}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    onClick={() => handleToggle(option)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '12px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        onChange={() => { }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>{option || t('vazio')}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer com contador e aviso */}
                    <div
                        style={{
                            padding: '8px 12px',
                            borderTop: '1px solid #e2e8f0',
                            fontSize: '11px',
                            background: selected.length === 0 ? '#fef3c7' : '#f8fafc',
                        }}
                    >
                        {selected.length === 0 ? (
                            <span style={{ color: '#92400e', fontWeight: '600' }}>
                                ⚠️ {t('filterWarning')}
                            </span>
                        ) : (
                            <span style={{ color: '#64748b' }}>
                                {t('selectedOf', { count: selected.length, total: options.length })}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
