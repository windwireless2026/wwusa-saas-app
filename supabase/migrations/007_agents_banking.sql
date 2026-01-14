-- Add banking information fields to agents table
-- These are required for agents that receive payments (outflow)

alter table public.agents 
    add column if not exists has_resale_certificate boolean, -- null = not applicable, true/false for US customers
    add column if not exists bank_name text,
    add column if not exists bank_routing_number text, -- Routing Number (US) / Código do Banco (BR)
    add column if not exists bank_account_number text,
    add column if not exists bank_account_type text, -- 'checking', 'savings'
    add column if not exists bank_holder_name text, -- Account holder name
    add column if not exists pix_key text, -- For Brazil payments
    add column if not exists zelle_email text, -- For US payments via Zelle
    add column if not exists paypal_email text, -- For PayPal payments
    add column if not exists crypto_wallet text,
    add column if not exists crypto_network text,
    add column if not exists iban text,
    add column if not exists swift_code text,
    add column if not exists intermediary_bank text,
    add column if not exists intermediary_routing text,
    add column if not exists contact_person text;

-- Comment for reporting context
comment on column public.agents.has_resale_certificate is 'Tracks if US customer has Resale Certificate. null=not customer, true=has RC, false=at risk for sales tax';
