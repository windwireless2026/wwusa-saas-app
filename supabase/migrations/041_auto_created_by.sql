-- Trigger para preencher automaticamente created_by se vier nulo
CREATE OR REPLACE FUNCTION public.set_inventory_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_inventory_created_by_trigger ON public.inventory;

CREATE TRIGGER set_inventory_created_by_trigger
BEFORE INSERT ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.set_inventory_created_by();

-- Grant permissions just in case
GRANT EXECUTE ON FUNCTION public.set_inventory_created_by() TO authenticated;
