// US Bank Routing Number Database
// Comprehensive list of major US banks and common regional routing numbers

export interface BankInfo {
  name: string;
  routing: string;
}

const US_BANKS: Record<string, string> = {
  // JPMorgan Chase
  '021000021': 'JPMorgan Chase',
  '021001033': 'JPMorgan Chase (NY)',
  '061000227': 'JPMorgan Chase (GA)',
  '067012099': 'JPMorgan Chase (FL)',
  '071000013': 'JPMorgan Chase (IL)',
  '111000614': 'JPMorgan Chase (TX)',
  '121000248': 'JPMorgan Chase (CA)',
  '267084131': 'Chase Bank',
  '322271627': 'Chase Bank',

  // Bank of America
  '026009593': 'Bank of America',
  '021000322': 'Bank of America',
  '053000196': 'Bank of America (NC)',
  '063000047': 'Bank of America (FL)',
  '067014822': 'Bank of America (FL)',
  '111000025': 'Bank of America (TX)',
  '121000035': 'Bank of America (CA)',
  '322271724': 'Bank of America',
  '011000138': 'Bank of America',

  // Wells Fargo
  '121042882': 'Wells Fargo',
  '063000021': 'Wells Fargo (FL)',
  '083000137': 'Wells Fargo',
  '091000019': 'Wells Fargo',
  '102000076': 'Wells Fargo',
  '111900659': 'Wells Fargo (TX)',

  // U.S. Bank (The one from user's screenshot)
  '125000105': 'U.S. Bank National Association',
  '091000022': 'U.S. Bank',
  '042000013': 'U.S. Bank',
  '122105155': 'U.S. Bank',
  '081000032': 'U.S. Bank',
  '121100782': 'U.S. Bank',

  // Citibank
  '021000089': 'Citibank',
  '031175755': 'Citibank',
  '121000019': 'Citibank',
  '321171184': 'Citibank',
  '321081669': 'Citibank',

  // Truist (formerly SunTrust and BB&T)
  '053101121': 'Truist Bank',
  '061000104': 'Truist Bank',
  '051000017': 'SunTrust Bank',
  '051400549': 'BB&T',

  // PNC Bank
  '031201360': 'PNC Bank',
  '043000096': 'PNC Bank',
  '071921891': 'PNC Bank',

  // TD Bank
  '011103093': 'TD Bank',
  '021272655': 'TD Bank',
  '036001808': 'TD Bank',

  // Capital One
  '054001204': 'Capital One',
  '056073612': 'Capital One',
  '031101169': 'Capital One 360',

  // Regions Bank
  '062000019': 'Regions Bank',
  '063191387': 'Regions Bank (FL)',
  '082000549': 'Regions Bank',

  // Everbank / TIAA
  '063092110': 'Everbank (FL)',

  // BankUnited (User Screenshot)
  '267090594': 'BankUnited, N.A.',
  '067090594': 'BankUnited, N.A.',

  // Fifth Third
  '042000314': 'Fifth Third Bank',
  '053012029': 'Fifth Third Bank',

  // Ally Bank
  '073972181': 'Ally Bank',
  '121137522': 'Ally Bank',

  // Chime / Bancorp / Stride
  '084009519': 'Chime (The Bancorp Bank)',
  '103100195': 'Chime (Stride Bank)',

  // Goldman Sachs / Marcus
  '021000128': 'Goldman Sachs',
  '053112592': 'Marcus by Goldman Sachs',

  // USAA
  '314074269': 'USAA Federal Savings Bank',

  // Discover Bank
  '031100649': 'Discover Bank',

  // Coastal / SVB / etc
  '021409169': 'Silicon Valley Bank',
  '022300173': 'Citizens Bank',
  '021300077': 'M&T Bank',
  '041000014': 'KeyBank',
  '052001633': 'Santander Bank',
};

export function lookupBankByRouting(routing: string): string | null {
  const cleanRouting = routing.replace(/\D/g, '');
  if (cleanRouting.length !== 9) return null;
  return US_BANKS[cleanRouting] || null;
}

export function searchBanksByName(name: string): BankInfo[] {
  const searchTerm = name.toLowerCase();
  return Object.entries(US_BANKS)
    .filter(([_, bankName]) => bankName.toLowerCase().includes(searchTerm))
    .map(([routing, bankName]) => ({ routing, name: bankName }));
}

export function formatRoutingNumber(routing: string): string {
  return routing.replace(/\D/g, '').slice(0, 9);
}
