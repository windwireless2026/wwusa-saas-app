'use client';

import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any; // The item to edit
}

// Option Lists based on User Specs
const CAPACITIES = [
  '32GB',
  '64GB',
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB',
  '41mm',
  '42mm',
  '46mm',
];
const GRADES = [
  'As-Is',
  'LACRADO',
  'A',
  'A-',
  'AB',
  'B',
  'Blocked',
  'C',
  'Open Box',
  'RMA',
  'RMA-Returns',
  'RR',
];
const COLORS = [
  'Mix',
  'Amarelo',
  'Azul',
  'Branco/Prata',
  'Coral',
  'Deserto',
  'Dourado',
  'Natural',
  'Preto',
  'Rosa',
  'Roxo',
  'Teal',
  'Ultramarine',
  'Verde',
  'Vermelho',
];

export default function AddItemModal({ isOpen, onClose, onSuccess, item }: AddItemModalProps) {
  const supabase = useSupabase(); // Hook com instância única
  const [loading, setLoading] = useState(false);
  const { alert, confirm } = useUI();
  const [productTypes, setProductTypes] = useState<
    { id: string; name: string; tracking_method: string; icon: string | null }[]
  >([]);
  const [catalogModels, setCatalogModels] = useState<{ name: string; type: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [stockLocations, setStockLocations] = useState<{ id: string; name: string }[]>([]);

  const [filteredModels, setFilteredModels] = useState<{ name: string; type: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    model: '',
    type: '', // Empty initial type
    capacity: '128GB',
    color: '',
    grade: '',
    price: '',
    status: 'Available',
    imei: '',
    serial_number: '',
    supplier_id: '',
    location_id: '',
    purchase_invoice: '',
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProductTypes();
      fetchCatalog();
      fetchSuppliers();
      fetchStockLocations();

      if (item) {
        // If imei is empty but serial_number looks like an IMEI (15 digits), use it as imei
        const effectiveImei = item.imei || (item.serial_number && /^\d{15}$/.test(item.serial_number) ? item.serial_number : '');
        const effectiveSerial = effectiveImei === item.serial_number ? '' : (item.serial_number || '');

        setFormData({
          model: item.model || '',
          type: item.type || '',
          capacity: item.capacity || '128GB',
          color: item.color || '',
          grade: item.grade || '',
          price: item.price?.toString() || '',
          status: item.status || 'Available',
          imei: effectiveImei,
          serial_number: effectiveSerial,
          supplier_id: item.agent_id || '',
          location_id: item.location_id || '',
          purchase_invoice: item.purchase_invoice || '',
        });
      } else {
        setFormData({
          model: '',
          type: '',
          capacity: '128GB',
          color: '',
          grade: '',
          price: '',
          status: 'Available',
          imei: '',
          serial_number: '',
          supplier_id: '',
          location_id: '',
          purchase_invoice: '',
        });
      }
    }
  }, [isOpen, item]);

  const fetchProductTypes = async () => {
    const { data } = await supabase
      .from('product_types')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    if (data) setProductTypes(data);
  };

  const fetchStockLocations = async () => {
    const { data } = await supabase
      .from('stock_locations')
      .select('id, name')
      .is('deleted_at', null)
      .order('name');
    if (data) setStockLocations(data);
  };

  // Filters...
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // Update Model Suggestions and Type detection
  useEffect(() => {
    let filtered = catalogModels;

    // 1. Filter by selected type if any
    if (formData.type) {
      filtered = filtered.filter(m => m.type === formData.type);
    }

    // 2. Filter by search term
    if (formData.model) {
      const lower = formData.model.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(lower));

      // Auto-detect type ONLY if type is not set and exact match found
      if (!formData.type) {
        const exactMatch = catalogModels.find(m => m.name.toLowerCase() === lower);
        if (exactMatch) {
          setFormData(prev => ({ ...prev, type: exactMatch.type }));
        }
      }
    }

    setFilteredModels(filtered);
  }, [formData.model, formData.type, catalogModels]);

  const fetchCatalog = async () => {
    const { data } = await supabase
      .from('product_catalog')
      .select('name, type')
      .is('deleted_at', null);
    if (data) {
      const sorted = data.sort((a: any, b: any) => {
        const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name);
      });
      setCatalogModels(sorted);
      setFilteredModels(sorted);
    }
  };

  const fetchSuppliers = async () => {
    // Fetch from new Agents table
    const { data, error } = await supabase
      .from('agents')
      .select('id, name')
      .contains('roles', ['fornecedor_estoque'])
      .is('deleted_at', null)
      .order('name');

    if (!error && data) {
      setSuppliers(data);
    } else {
      // Fallback for transition
      const { data: oldData } = await supabase.from('suppliers').select('id, name').order('name');
      if (oldData) setSuppliers(oldData);
    }
  };

  const validateLuhn = (imei: string) => {
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(imei[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation logic
      const selectedType = productTypes.find(t => t.name === formData.type);
      const trackingMethod =
        selectedType?.tracking_method || (formData.type === 'Cell phone' ? 'IMEI' : 'SERIAL');
      const useIMEI = trackingMethod === 'IMEI';

      if (!formData.type) throw new Error('Selecione o tipo do produto.');
      if (!formData.model) throw new Error('Informe o modelo.');
      if (!formData.color) throw new Error('Selecione a cor.');
      if (!formData.grade) throw new Error('Selecione a grade.');
      if (!formData.supplier_id) throw new Error('Selecione o fornecedor.');
      if (!formData.location_id) throw new Error('Selecione o local de estoque.');
      if (!formData.purchase_invoice) throw new Error('Informe a invoice de compra.');

      // IMEI Validation & Cleaning (Luhn)
      let imeiClean = '';
      if (useIMEI) {
        imeiClean = formData.imei.replace(/\D/g, '');
        if (imeiClean.length !== 15) throw new Error('IMEI deve ter 15 dígitos.');
        if (!validateLuhn(imeiClean))
          throw new Error('IMEI inválido (Falha no Algoritmo de Luhn).');
      }

      // Duplicate Check Logic
      const identifier = useIMEI ? imeiClean : formData.serial_number.trim();
      const field = useIMEI ? 'imei' : 'serial_number';

      if (identifier) {
        // Check if exists and is NOT Sold/RMA (Active in stock)
        let checkQuery = supabase
          .from('inventory')
          .select('id, status')
          .eq(field, identifier)
          .is('deleted_at', null)
          .not('status', 'in', '("Sold", "RMA")'); // Correct syntax for PostgREST 'not in'

        if (item?.id) {
          checkQuery = checkQuery.neq('id', item.id);
        }

        const { data: existing, error: checkError } = await checkQuery;
        if (checkError) throw checkError;

        if (existing && existing.length > 0) {
          throw new Error(
            `Este ${field.toUpperCase()} já está cadastrado no estoque com status "${existing[0].status}".`
          );
        }
      }

      // 1. Check/Create Model
      let modelName = formData.model;
      const modelExists = catalogModels.some(m => m.name.toLowerCase() === modelName.toLowerCase());
      if (!modelExists && modelName.trim()) {
        await supabase.from('product_catalog').insert({
          name: modelName,
          type: formData.type,
          manufacturer: 'Apple',
        });
      }

      // 2. Upsert Inventory Item
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const inventoryData: any = {
        model: modelName,
        capacity: formData.capacity,
        color: formData.color || null,
        grade: formData.grade || null,
        price: parseFloat(formData.price),
        status: formData.status,
        imei: useIMEI ? imeiClean : null,
        serial_number: !useIMEI ? formData.serial_number : null,
        agent_id: formData.supplier_id || null,
        location_id: formData.location_id || null,
        purchase_invoice: formData.purchase_invoice,
        created_by: user?.id,
      };

      // If editing, don't overwrite the original creator
      if (item?.id) {
        delete inventoryData.created_by;
      }

      let error;
      if (item?.id) {
        const { error: updateError } = await supabase
          .from('inventory')
          .update(inventoryData)
          .eq('id', item.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('inventory').insert([inventoryData]);
        error = insertError;
      }

      if (error) throw error;

      onSuccess();
      onClose();
      await alert(
        'Sucesso',
        item?.id ? 'Item atualizado com sucesso!' : 'Item adicionado ao estoque!',
        'success'
      );
    } catch (error: any) {
      await alert('Erro', 'Erro ao salvar item: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    const confirmed = await confirm(
      'Excluir Item',
      `Tem certeza que deseja excluir "${formData.model}"?\n\nEsta ação pode ser desfeita restaurando da lixeira.`,
      'danger'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

      await alert('Sucesso', 'Item excluído com sucesso!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      await alert('Erro', 'Erro ao excluir item: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isUnknownModel =
    formData.model.length > 0 &&
    !catalogModels.some(m => m.name.toLowerCase() === formData.model.toLowerCase());
  const matchedType = productTypes.find(t => t.name === formData.type);
  const trackingLabel =
    matchedType?.tracking_method || (formData.type === 'Cell phone' ? 'IMEI' : 'SERIAL');
  const showIMEIField = trackingLabel === 'IMEI';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '600px',
          padding: '32px',
          background: '#ffffff',
          color: '#000',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '1px solid #eee',
            paddingBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {item ? 'Editar Item' : 'Novo Item'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <form id="add-item-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {/* Row 0: Product Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '6px',
                color: '#555',
              }}
            >
              TIPO DE PRODUTO *
            </label>
            <select
              required
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value, model: '' })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: '#fff',
                color: '#333',
              }}
            >
              <option value="">Selecione o tipo...</option>
              {productTypes.map(t => (
                <option key={t.id} value={t.name}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1: Model (Full Width) */}
          <div style={{ position: 'relative' }} ref={wrapperRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                MODELO *{' '}
                {isUnknownModel && formData.type && (
                  <span style={{ color: '#F59E0B', fontSize: '10px' }}>(Novo no Catálogo)</span>
                )}
              </label>
            </div>
            <input
              type="text"
              placeholder={
                formData.type ? 'Escolha ou digite o modelo...' : 'Selecione o tipo primeiro...'
              }
              disabled={!formData.type}
              required
              value={formData.model}
              className="no-browser-autocomplete"
              autoComplete="off"
              onFocus={() => setShowSuggestions(true)}
              onChange={e => {
                setFormData({ ...formData, model: e.target.value });
                setShowSuggestions(true);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: formData.type ? '#fff' : '#f5f5f5',
                color: '#333',
              }}
            />
            {showSuggestions && formData.type && filteredModels.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  marginTop: '4px',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {filteredModels.map(m => (
                  <div
                    key={m.name}
                    onClick={() => {
                      setFormData({ ...formData, model: m.name, type: m.type });
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #f5f5f5',
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{m.name}</span>{' '}
                    <span style={{ fontSize: '10px', color: '#888', float: 'right' }}>
                      {m.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Capacity & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                CAPACIDADE *
              </label>
              <select
                required
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              >
                {CAPACITIES.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                COR *
              </label>
              <select
                required
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              >
                <option value="">Selecione...</option>
                {COLORS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Identifier (IMEI or Serial) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '6px',
                color: '#555',
              }}
            >
              {trackingLabel} *
            </label>
            {showIMEIField ? (
              <input
                type="text"
                placeholder="35..."
                required
                value={formData.imei}
                onChange={e =>
                  setFormData({ ...formData, imei: e.target.value, serial_number: '' })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              />
            ) : (
              <input
                type="text"
                placeholder="Serial..."
                required
                value={formData.serial_number}
                onChange={e =>
                  setFormData({ ...formData, serial_number: e.target.value, imei: '' })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              />
            )}
          </div>

          {/* Row 4: Pricing & Invoice */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                PREÇO DE COMPRA ($) *
              </label>
              <input
                type="number"
                placeholder="0.00"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                INVOICE DE COMPRA *
              </label>
              <input
                type="text"
                placeholder="#INV-001"
                required
                value={formData.purchase_invoice}
                onChange={e => setFormData({ ...formData, purchase_invoice: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              />
            </div>
          </div>

          {/* Row 5: Supplier & Grade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                FORNECEDOR *
              </label>
              <select
                required
                value={formData.supplier_id}
                onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              >
                <option value="">Selecione...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: '#555',
                }}
              >
                GRADE *
              </label>
              <select
                required
                value={formData.grade}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#333',
                }}
              >
                <option value="">Selecione...</option>
                {GRADES.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Location */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '6px',
                color: '#555',
              }}
            >
              LOCAL DO ESTOQUE *
            </label>
            <select
              required
              value={formData.location_id}
              onChange={e => setFormData({ ...formData, location_id: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: '#fff',
                color: '#333',
              }}
            >
              <option value="">Selecione o local...</option>
              {stockLocations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  📍 {loc.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Modal Footer */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {item && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '700',
                  transition: 'all 0.2s',
                }}
              >
                🗑️ Excluir Item
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="add-item-form"
              disabled={loading}
              style={{
                padding: '10px 32px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
              }}
            >
              {loading ? 'Salvando...' : item ? 'Salvar Alterações' : 'Adicionar ao Estoque'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
