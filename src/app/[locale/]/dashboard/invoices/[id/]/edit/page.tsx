'use client';

import NewInvoicePage from '@/components/dashboard/NewInvoicePage';
import { useParams } from 'next/navigation';

export default function EditInvoicePage() {
    const params = useParams();
    const id = params.id as string;

    // For now, reuse NewInvoicePage but we should ideally enhance it to accept an 'id' for editing
    return <NewInvoicePage />;
}
