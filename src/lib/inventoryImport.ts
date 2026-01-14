// Inventory Import Helper Functions
import { supabase } from '@/lib/supabase';

export const downloadTemplate = () => {
  const headers = [
    'Modelo',
    'Capacidade',
    'Cor',
    'Grade',
    'Preço',
    'Status',
    'IMEI',
    'Número de Série',
    'Invoice de Compra',
  ];
  const exampleData = [
    'iPhone 15 Pro Max',
    '256GB',
    'Titanium Natural',
    'A+',
    '1190',
    'Available',
    '355450216093731',
    'F17XM9QZ4L',
    'INV-2024-001',
  ];

  const csvContent = [
    headers.join(','),
    exampleData.join(','),
    ',,,,,,,,', // Empty row for user to fill
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template_importacao_estoque.csv';
  link.click();
};

export const processInventoryFile = async (
  file: File,
  alert: any
): Promise<{ success: number; errors: string[] }> => {
  try {
    // Dynamic import of xlsx library
    const XLSX = (await import('xlsx')).default;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async event => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          if (jsonData.length === 0) {
            throw new Error('Planilha vazia!');
          }

          // Validate and transform data
          const itemsToInsert = [];
          const errors = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNum = i + 2; // Excel row number (header is row 1)

            // Validate required fields
            if (!row['Modelo'] || !row['Preço'] || !row['IMEI']) {
              errors.push(`Linha ${rowNum}: Modelo, Preço e IMEI são obrigatórios`);
              continue;
            }

            // Check if IMEI already exists
            const { data: existing } = await supabase
              .from('inventory')
              .select('id')
              .eq('imei', row['IMEI'])
              .is('deleted_at', null)
              .maybeSingle();

            if (existing) {
              errors.push(`Linha ${rowNum}: IMEI ${row['IMEI']} já existe no estoque`);
              continue;
            }

            // Parse price (handle both dot and comma)
            const rawPrice = row['Preço']?.toString() || '0';
            const sanitizedPrice = rawPrice.replace(',', '.');
            const price = parseFloat(sanitizedPrice);

            itemsToInsert.push({
              model: row['Modelo'],
              capacity: row['Capacidade'] || 'N/A',
              color: row['Cor'] || 'N/A',
              grade: row['Grade'] || 'N/A',
              price: isNaN(price) ? 0 : price,
              status: row['Status'] || 'Available',
              imei: row['IMEI'],
              serial_number: row['Número de Série'] || null,
              purchase_invoice: row['Invoice de Compra'] || null,
              created_by: user?.id,
            });
          }

          // Insert valid items
          if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase.from('inventory').insert(itemsToInsert);

            if (insertError) throw insertError;
          }

          resolve({ success: itemsToInsert.length, errors });
        } catch (error: any) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  } catch (error: any) {
    throw error;
  }
};
