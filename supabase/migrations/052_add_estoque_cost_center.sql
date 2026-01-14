-- Insert 'ESTOQUE' cost center if it doesn't exist
INSERT INTO cost_centers (name, code, active)
VALUES ('ESTOQUE', 'EST', true)
ON CONFLICT (name) DO NOTHING;
