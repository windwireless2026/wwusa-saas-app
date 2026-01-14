import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define Interface for AutoTable to avoid TS errors if possible, or just cast
interface AutoTable extends jsPDF {
    lastAutoTable: { finalY: number };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const cookieStore = await cookies();

    // Create authenticated client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    // 1. Fetch Estimate Data
    const { data: estimate, error } = await supabase
        .from('estimates')
        .select(`
            *,
            items:estimate_items(*),
            customer:agents!customer_id(*)
        `)
        .eq('id', id)
        .single();

    if (error || !estimate) {
        console.error('Error fetching estimate:', error);
        return NextResponse.json({ error: 'Estimate not found or access denied' }, { status: 404 });
    }

    const { data: company } = await supabase
        .from('company_settings')
        .select('*')
        .single();

    // 2. Initialize PDF
    // eslint-disable-next-line new-cap
    const doc = new jsPDF() as unknown as AutoTable;

    // 3. Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(company?.company_name || 'WindWireless', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(company?.company_address || '', 14, 26);
    doc.text(`${company?.company_phone || ''} | ${company?.company_email || ''}`, 14, 31);

    // Title / Estimate #
    doc.setFontSize(18);
    doc.setTextColor(124, 58, 237); // Purple
    doc.text('ESTIMATE', 150, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`#${estimate.estimate_number}`, 150, 28);

    doc.setFontSize(10);
    doc.text(`Date: ${new Date(estimate.estimate_date).toLocaleDateString()}`, 150, 35);
    if (estimate.ship_date) {
        doc.text(`Ship Date: ${new Date(estimate.ship_date).toLocaleDateString()}`, 150, 40);
    }

    // 4. Addresses
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 55);
    doc.text('Ship To:', 105, 55);

    doc.setFont('helvetica', 'normal');
    const billTo = [
        estimate.bill_to_name,
        estimate.bill_to_address,
        `${estimate.bill_to_city || ''}, ${estimate.bill_to_state || ''} ${estimate.bill_to_zip || ''}`,
        estimate.bill_to_country
    ].filter(Boolean).join('\n');

    const shipTo = [
        estimate.ship_to_name,
        estimate.ship_to_address,
        `${estimate.ship_to_city || ''}, ${estimate.ship_to_state || ''} ${estimate.ship_to_zip || ''}`,
        estimate.ship_to_country,
        estimate.ship_to_phone
    ].filter(Boolean).join('\n');

    doc.text(billTo || 'N/A', 14, 62);
    doc.text(shipTo || 'N/A', 105, 62);

    // 5. Items Table
    const tableData = estimate.items?.map((item: any) => [
        `${item.model} ${item.capacity}\n${item.description || ''}`,
        item.grade,
        item.quantity,
        `$${item.unit_price.toFixed(2)}`,
        `$${(item.quantity * item.unit_price).toFixed(2)}`
    ]) || [];

    autoTable(doc, {
        startY: 90,
        head: [['Item / Description', 'Grade', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Item
            1: { cellWidth: 20, halign: 'center' }, // Grade
            2: { cellWidth: 15, halign: 'center' }, // Qty
            3: { cellWidth: 25, halign: 'right' }, // Price
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' } // Total
        }
    });

    // 6. Totals
    const finalY = (doc as any).lastAutoTable?.finalY || 100 + 10;

    // Calculate totals just in case DB values are weird, but usually trust DB or recalculate? 
    // Trust DB values stored on estimate
    const subtotal = estimate.subtotal || 0;
    const discount = estimate.discount_amount || 0;
    const total = subtotal - discount;

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY + 10);
    doc.text(`$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 195, finalY + 10, { align: 'right' });

    if (discount > 0) {
        doc.setTextColor(239, 68, 68); // Red
        doc.text(`Discount:`, 140, finalY + 16);
        doc.text(`-$${discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 195, finalY + 16, { align: 'right' });
        doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total:`, 140, finalY + 25);
    doc.text(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 195, finalY + 25, { align: 'right' });

    // 7. Footer / Terms
    let currentY = finalY + 40;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    if (estimate.terms) {
        doc.setFont('helvetica', 'bold');
        doc.text('TERMS & CONDITIONS', 14, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(estimate.terms, 14, currentY, { maxWidth: 180 });
        currentY += 20; // approximate space
    }

    if (estimate.payment_methods) {
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT METHODS', 14, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(estimate.payment_methods, 14, currentY, { maxWidth: 180 });
    }

    // Output PDF Buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="Estimate_${estimate.estimate_number}.pdf"`
        }
    });
}
