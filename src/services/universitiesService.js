// List of 26 public universities in South Africa with closing dates
// Closing dates are placeholders; update as needed per intake.

export const UNIVERSITIES = [
  { id: 'uct', name: 'University of Cape Town (UCT)', closingDate: '2025-07-31', website: 'https://www.uct.ac.za/' },
  { id: 'wits', name: 'University of the Witwatersrand (Wits)', closingDate: '2025-08-31', website: 'https://www.wits.ac.za/' },
  { id: 'up', name: 'University of Pretoria (UP)', closingDate: '2025-08-31', website: 'https://www.up.ac.za/' },
  { id: 'su', name: 'Stellenbosch University (SU)', closingDate: '2025-07-31', website: 'https://www.sun.ac.za/' },
  { id: 'ukzn', name: 'University of KwaZulu-Natal (UKZN)', closingDate: '2025-09-30', website: 'https://www.ukzn.ac.za/' },
  { id: 'uj', name: 'University of Johannesburg (UJ)', closingDate: '2025-09-30', website: 'https://www.uj.ac.za/' },
  { id: 'nwu', name: 'North-West University (NWU)', closingDate: '2025-08-31', website: 'https://www.nwu.ac.za/' },
  { id: 'ufs', name: 'University of the Free State (UFS)', closingDate: '2025-09-30', website: 'https://www.ufs.ac.za/' },
  { id: 'uwc', name: 'University of the Western Cape (UWC)', closingDate: '2025-09-30', website: 'https://www.uwc.ac.za/' },
  { id: 'rhodes', name: 'Rhodes University', closingDate: '2025-08-31', website: 'https://www.ru.ac.za/' },
  { id: 'nmu', name: 'Nelson Mandela University (NMU)', closingDate: '2025-09-30', website: 'https://www.mandela.ac.za/' },
  { id: 'ufh', name: 'University of Fort Hare (UFH)', closingDate: '2025-09-30', website: 'https://www.ufh.ac.za/' },
  { id: 'ul', name: 'University of Limpopo (UL)', closingDate: '2025-10-31', website: 'https://www.ul.ac.za/' },
  { id: 'univen', name: 'University of Venda (UNIVEN)', closingDate: '2025-10-31', website: 'https://www.univen.ac.za/' },
  { id: 'wsu', name: 'Walter Sisulu University (WSU)', closingDate: '2025-10-31', website: 'https://www.wsu.ac.za/' },
  { id: 'unizulu', name: 'University of Zululand (UNIZULU)', closingDate: '2025-10-31', website: 'https://www.unizulu.ac.za/' },
  { id: 'tut', name: 'Tshwane University of Technology (TUT)', closingDate: '2025-10-31', website: 'https://www.tut.ac.za/' },
  { id: 'cput', name: 'Cape Peninsula University of Technology (CPUT)', closingDate: '2025-10-31', website: 'https://www.cput.ac.za/' },
  { id: 'dut', name: 'Durban University of Technology (DUT)', closingDate: '2025-10-31', website: 'https://www.dut.ac.za/' },
  { id: 'cut', name: 'Central University of Technology (CUT)', closingDate: '2025-09-30', website: 'https://www.cut.ac.za/' },
  { id: 'vut', name: 'Vaal University of Technology (VUT)', closingDate: '2025-10-31', website: 'https://www.vut.ac.za/' },
  { id: 'mut', name: 'Mangosuthu University of Technology (MUT)', closingDate: '2025-10-31', website: 'https://www.mut.ac.za/' },
  { id: 'spu', name: 'Sol Plaatje University (SPU)', closingDate: '2025-09-30', website: 'https://www.spu.ac.za/' },
  { id: 'ump', name: 'University of Mpumalanga (UMP)', closingDate: '2025-09-30', website: 'https://www.ump.ac.za/' },
  { id: 'smu', name: 'Sefako Makgatho Health Sciences University (SMU)', closingDate: '2025-09-30', website: 'https://www.smu.ac.za/' },
  { id: 'unisa', name: 'University of South Africa (UNISA)', closingDate: '2025-11-30', website: 'https://www.unisa.ac.za/' }
];

export const isOpen = (closingDate, now = new Date()) => {
  try {
    const d = new Date(closingDate);
    return d >= now;
  } catch {
    return true;
  }
};

export const getOpenUniversities = (now = new Date()) => {
  return UNIVERSITIES.filter(u => isOpen(u.closingDate, now));
};

export const getUniversityById = (id) => UNIVERSITIES.find(u => u.id === id) || null;