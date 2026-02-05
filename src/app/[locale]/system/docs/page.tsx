'use client';

import { useState } from 'react';

type TabType = 'executive' | 'technical' | 'governance';

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('executive');

    const tabStyle: React.CSSProperties = {
        padding: '12px 24px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '10px',
        transition: 'all 0.2s',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    const activeTabStyle: React.CSSProperties = {
        ...tabStyle,
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
    };

    const inactiveTabStyle: React.CSSProperties = {
        ...tabStyle,
        background: '#f1f5f9',
        color: '#64748b',
    };

    const sectionStyle: React.CSSProperties = {
        background: '#fff',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    };

    const h2Style: React.CSSProperties = {
        fontSize: '20px',
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    };

    const h3Style: React.CSSProperties = {
        fontSize: '17px',
        fontWeight: '700',
        color: '#334155',
        marginBottom: '12px',
        marginTop: '20px',
    };

    const pStyle: React.CSSProperties = {
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#475569',
        marginBottom: '12px',
    };

    const listStyle: React.CSSProperties = {
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#475569',
        paddingLeft: '20px',
        marginBottom: '16px',
    };

    const badgeStyle = (color: string) => ({
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        background: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
    } as React.CSSProperties);

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                    Documentação Técnica do Projeto
                </h1>
                <p style={{ fontSize: '16px', color: '#64748b' }}>
                    Diretrizes de infraestrutura, arquitetura, segurança e continuidade Wind Wireless.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', padding: '6px', background: '#f1f5f9', borderRadius: '14px', width: 'fit-content' }}>
                <button
                    onClick={() => setActiveTab('executive')}
                    style={activeTab === 'executive' ? activeTabStyle : inactiveTabStyle}
                >
                    💼 Visão Executiva
                </button>
                <button
                    onClick={() => setActiveTab('technical')}
                    style={activeTab === 'technical' ? activeTabStyle : inactiveTabStyle}
                >
                    🛠️ Arquitetura Técnica
                </button>
                <button
                    onClick={() => setActiveTab('governance')}
                    style={activeTab === 'governance' ? activeTabStyle : inactiveTabStyle}
                >
                    ⚖️ Governança e Retorno (ROI)
                </button>
            </div>

            {activeTab === 'executive' && (
                <div className="animate-in fade-in duration-500">
                    <div style={sectionStyle}>
                        <h2 style={h2Style}>🚀 Onde o sistema vive? (Hospedagem)</h2>
                        <p style={pStyle}>
                            Hospedamos na <strong>Vercel</strong>, líder mundial em aplicações Next.js. Isso garante carregamento instantâneo, segurança contra ataques de negação de serviço e escalabilidade ilimitada sem necessidade de manutenção de servidores físicos.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <span style={badgeStyle('#7c3aed')}>Vercel</span>
                            <span style={badgeStyle('#10b981')}>Performance Máxima</span>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={h2Style}>🗄️ O Cofre de Dados (Banco de Dados)</h2>
                        <p style={pStyle}>
                            Toda a inteligência e registros estão no <strong>Supabase</strong>. Diferente de soluções engessadas, temos um banco PostgreSQL completo, com backups automáticos, proteção criptográfica e isolamento de dados entre usuários.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <span style={badgeStyle('#059669')}>Supabase</span>
                            <span style={badgeStyle('#f59e0b')}>Criptografia de Dados</span>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={h2Style}>🛡️ Segurança de Acesso</h2>
                        <p style={pStyle}>
                            O sistema utiliza autenticação moderna e políticas de "Menor Privilégio": cada nível hierárquico só acessa os dados indispensáveis para sua função, prevenindo vazamentos acidentais ou acessos indevidos.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'technical' && (
                <div className="animate-in fade-in duration-500">
                    <div style={sectionStyle}>
                        <h2 style={h2Style}>🏗️ Stack Tecnológica de Ponta</h2>
                        <p style={pStyle}>
                            Utilizamos <strong>Next.js 14+ (App Router)</strong> com <strong>TypeScript</strong>. Esta combinação é a escolha das maiores empresas de tecnologia (como TikTok, Twitch e Notion) devido à robustez e facilidade de manutenção a longo prazo.
                        </p>
                        <ul style={listStyle}>
                            <li><strong>Frontend:</strong> React 18, otimizado para Server-Side Rendering (SSR).</li>
                            <li><strong>Segurança:</strong> Row Level Security (RLS) nativo no PostgreSQL.</li>
                            <li><strong>Desenvolvimento:</strong> CI/CD automatizado via GitHub Actions.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={h2Style}>🔄 Continuidade e Manutenibilidade</h2>
                        <p style={pStyle}>
                            O código segue padrões internacionais (Clean Code), facilitando a entrada de novos desenvolvedores. Toda a lógica de banco está versionada, permitindo restaurar o sistema em minutos caso ocorra qualquer imprevisto.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'governance' && (
                <div className="animate-in fade-in duration-500">
                    <div style={sectionStyle}>
                        <h2 style={h2Style}>🏆 Por que este investimento é o melhor caminho?</h2>
                        <p style={pStyle}>
                            Diferente de assinar um software pronto (SaaS genérico), a Wind está construindo um <strong>Ativo Digital Proprietário</strong>.
                        </p>
                        <ul style={listStyle}>
                            <li><strong>Eficiência Operacional:</strong> O sistema é desenhado sob medida para o fluxo de leilões da Wind, eliminando tarefas manuais que geram erros e custos ocultos.</li>
                            <li><strong>Independência Tecnológica:</strong> A empresa é dona do código e dos dados. Não há risco de um fornecedor aumentar preços abusivamente ou encerrar o serviço.</li>
                            <li><strong>Valor de Mercado:</strong> Uma empresa com processos digitalizados e software próprio possui um valuation significativamente maior em eventuais rodadas de investimento ou venda.</li>
                            <li><strong>Blindagem de Dados (Ativo):</strong> A implementação de <strong>Database Functions</strong> protege o coração do negócio, garantindo que regras de preço e estoque sejam invioláveis.</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={h2Style}>⚠️ Fragilidades, Riscos e Plano de Mitigação</h2>
                        <p style={pStyle}>Transparência sobre os desafios técnicos e o progresso das correções:</p>

                        <h3 style={h3Style}>1. Falta de Testes Automatizados</h3>
                        <p style={pStyle}><em>Risco:</em> Surgimento de bugs em funções antigas ao criar novas ferramentas.</p>
                        <p style={pStyle}><strong>Como corrigimos:</strong> Iniciaremos a implementação de testes <strong>Jest (unitários)</strong> nas funções de cálculo financeiro e <strong>Cypress (ponta-a-ponta)</strong> nos fluxos críticos de entrada de estoque.</p>

                        <h3 style={h3Style}>2. Políticas de Segurança (RLS) em Ajuste</h3>
                        <p style={pStyle}><em>Risco:</em> Algumas tabelas estão em modo de desenvolvimento para agilizar o setup inicial.</p>
                        <p style={pStyle}><strong>Como corrigimos:</strong> Estamos realizando uma <strong>auditoria de segurança</strong> e ativando o RLS em todas as tabelas, garantindo que usuários operacionais nunca acessem dados financeiros sensíveis.</p>

                        <h3 style={h3Style}>3. Validações Críticas e Integridade (EM CURSO ✅)</h3>
                        <p style={pStyle}><em>Risco:</em> Regras de negócio processadas puramente no navegador podem ser vulneráveis ou falhar em transações complexas.</p>
                        <p style={pStyle}><strong>Como corrigimos:</strong> Já migramos a **Conversão de Venda** e a **Baixa de Estoque** para **Database Functions** (080_core). Isso garante que o estoque só mude via regra de negócio fixa, impedindo erros humanos ou hackers.</p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={h2Style}>👥 Gestão de Continuidade</h2>
                        <p style={pStyle}>
                            Como a empresa segue caso haja troca de equipe técnica?
                        </p>
                        <h3 style={h3Style}>O projeto exige um desenvolvedor especializado?</h3>
                        <p style={pStyle}>
                            O sistema utiliza as tecnologias mais populares do mercado global. Isso significa que a empresa tem <strong>fácil acesso a profissionais qualificados</strong>. Não dependemos de uma tecnologia "exótica" ou proprietária. Qualquer desenvolvedor Full Stack moderno consegue assumir a operação em poucos dias.
                        </p>
                    </div>

                    <div style={sectionStyle}>
                        <h2 style={h2Style}>💰 Estrutura de Custos de Infraestrutura</h2>
                        <p style={pStyle}>O projeto é otimizado para crescer conforme o uso, evitando desperdícios iniciais:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontWeight: '800', marginBottom: '8px' }}>Vercel</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    <strong>Hobby:</strong> Grátis para teste.<br />
                                    <strong>Pro:</strong> ~$20/mês. Quando houver múltiplos acessos simultâneos ou equipe de desenvolvimento.
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontWeight: '800', marginBottom: '8px' }}>Supabase</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    <strong>Free:</strong> Suficiente para o início.<br />
                                    <strong>Pro:</strong> ~$25/mês. Recomendado para produção real devido aos backups diários automáticos.
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontWeight: '800', marginBottom: '8px' }}>GitHub</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    <strong>Free:</strong> Grátis para repositórios privados da equipe.<br />
                                    <strong>Enterprise:</strong> Opcional no futuro para maior controle de auditoria de código.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
