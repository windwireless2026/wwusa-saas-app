'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useParams } from 'next/navigation';

export default function PrintEstimatePage() {
    const supabase = useSupabase();
    const params = useParams();
    const { id } = params;

    const [estimate, setEstimate] = useState<any>(null);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [estRes, settingsRes] = await Promise.all([
                supabase.from('estimates').select('*, items:estimate_items(*), customer:agents(*)').eq('id', id).single(),
                supabase.from('company_settings').select('*').limit(1).single()
            ]);

            if (estRes.data) setEstimate(estRes.data);
            if (settingsRes.data) setCompanyInfo(settingsRes.data);
            setLoading(false);
        };
        loadData();
    }, [id]);

    useEffect(() => {
        if (!loading && estimate) {
            // Trigger print after a short delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [loading, estimate]);

    if (loading) return <div>Carregando...</div>;
    if (!estimate) return <div>Estimate não encontrado.</div>;

    const subtotal = estimate.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0;
    const total = subtotal - (estimate.discount_amount || 0);

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: 'white', color: 'black', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}>{companyInfo?.company_name || 'WWUSA'}</h1>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                        {companyInfo?.company_address}<br />
                        {companyInfo?.company_phone} | {companyInfo?.company_email}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, color: '#7c3aed', fontSize: '24px' }}>ESTIMATE</h2>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>#{estimate.estimate_number}</p>
                    <p style={{ margin: '5px 0', fontSize: '12px' }}>Date: {new Date(estimate.estimate_date).toLocaleDateString()}</p>
                    {estimate.ship_date && <p style={{ margin: '5px 0', fontSize: '12px' }}>Ship date: {new Date(estimate.ship_date).toLocaleDateString()}</p>}
                </div>
            </div>

            {/* Addresses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                <div>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '10px', color: '#999', marginBottom: '10px' }}>Bill To</h4>
                    <pre style={{ margin: 0, fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
                        {estimate.bill_to_name}{'\n'}
                        {estimate.bill_to_address}{'\n'}
                        {estimate.bill_to_city}, {estimate.bill_to_state} {estimate.bill_to_zip}{'\n'}
                        {estimate.bill_to_country}
                    </pre>
                </div>
                <div>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '10px', color: '#999', marginBottom: '10px' }}>Ship To</h4>
                    <pre style={{ margin: 0, fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
                        {estimate.ship_to_name}{'\n'}
                        {estimate.ship_to_address}{'\n'}
                        {estimate.ship_to_city}, {estimate.ship_to_state} {estimate.ship_to_zip}{'\n'}
                        {estimate.ship_to_country}{'\n'}
                        {estimate.ship_to_phone}
                    </pre>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px' }}>Item / Description</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', width: '60px' }}>Grade</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', width: '60px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', width: '100px' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', width: '100px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {estimate.items?.map((item: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontSize: '13px' }}>
                                <strong>{item.model} {item.capacity}</strong><br />
                                <span style={{ fontSize: '11px', color: '#666' }}>{item.description}</span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '12px', fontSize: '13px' }}>{item.grade}</td>
                            <td style={{ textAlign: 'center', padding: '12px', fontSize: '13px' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', padding: '12px', fontSize: '13px' }}>${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: 'right', padding: '12px', fontSize: '13px', fontWeight: 'bold' }}>${(item.quantity * item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span>Subtotal:</span>
                        <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {estimate.discount_amount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#ef4444' }}>
                            <span>Discount:</span>
                            <span>-${estimate.discount_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '2px solid #000', paddingTop: '12px', fontSize: '18px', fontWeight: '900' }}>
                        <span>Total:</span>
                        <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Notes & Terms */}
            <div style={{ marginTop: '60px', fontSize: '11px', color: '#444' }}>
                {estimate.terms && (
                    <div style={{ marginBottom: '20px' }}>
                        <h5 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', color: '#999' }}>Terms & Conditions</h5>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{estimate.terms}</p>
                    </div>
                )}
                {estimate.payment_methods && (
                    <div style={{ marginBottom: '20px' }}>
                        <h5 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', color: '#999' }}>Payment Methods</h5>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{estimate.payment_methods}</p>
                    </div>
                )}
                {estimate.customer_notes && (
                    <div>
                        <h5 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', color: '#999' }}>Notes</h5>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{estimate.customer_notes}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '100px', textAlign: 'center', fontSize: '10px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                Thank you for your business! Generated on {new Date().toLocaleString()}
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
