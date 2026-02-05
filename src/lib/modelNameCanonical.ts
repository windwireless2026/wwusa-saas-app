/**
 * Canonicalização de nomes de modelo para batimento entre:
 * - Planilha de importação (ex.: "IPHONE SE2 64GB (2020)")
 * - Catálogo (ex.: "iPhone SE (2ª geração) 64GB")
 * Assim o match não depende do texto exato do arquivo.
 */

/** Aplica aliases conhecidos: variantes do arquivo → mesmo que no catálogo */
function canonicalizeForMatch(name: string): string {
  let s = String(name || '');
  // Remove ano entre parênteses (ex.: "(2020)") para não diferenciar
  s = s.replace(/\s*\(\d{4}\)\s*/g, ' ');
  // SE2 (arquivo) = SE (2ª geração) (catálogo)
  s = s.replace(/\bSE2\b/gi, 'SE 2ª geração');
  return s.trim();
}

/**
 * Normaliza para comparação: lowercase, sem espaços/hífens, só alfanum.
 * Use sempre após canonicalizeForMatch para que planilha e catálogo batam.
 */
export function normalizeModelNameForMatch(name: string): string {
  const canonical = canonicalizeForMatch(name);
  return canonical
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Verifica se modelo+capacidade da planilha batem com modelo+capacidade do item (invoice/catálogo).
 */
export function matchModelAndCapacity(
  spreadsheetModel: string,
  spreadsheetCapacity: string,
  catalogModel: string,
  catalogCapacity: string
): boolean {
  const fullSpreadsheet = normalizeModelNameForMatch(spreadsheetModel + spreadsheetCapacity);
  const fullCatalog = normalizeModelNameForMatch(catalogModel + (catalogCapacity || ''));
  return fullSpreadsheet === fullCatalog;
}
