// Bursaries service: stub dataset with field-of-study categories and closing dates.
// In production, replace fetchBursariesFromWeb() with a backend integration to bursariesza.

export const FIELDS_OF_STUDY = [
  'Engineering', 'Health Sciences', 'Information Technology', 'Education',
  'Business & Finance', 'Law', 'Agriculture', 'Arts & Humanities', 'Science'
];

export const BURSARIES = [
  { id: 'nsfas', name: 'NSFAS', provider: 'NSFAS', field: 'All', amount: 'Full cost of study (means-tested)', closingDate: '2025-01-31', website: 'https://www.nsfas.org.za/' },
  { id: 'eskom-eng', name: 'Eskom Bursary', provider: 'Eskom', field: 'Engineering', amount: 'Tuition + stipend', closingDate: '2025-07-31', website: 'https://www.eskom.co.za/' },
  { id: 'armscor-eng', name: 'ARMSCOR Bursary', provider: 'ARMSCOR', field: 'Engineering', amount: 'Tuition + allowances', closingDate: '2025-08-31', website: 'https://www.armscor.co.za/' },
  { id: 'sasol-eng', name: 'Sasol Bursary', provider: 'Sasol', field: 'Engineering', amount: 'Full bursary', closingDate: '2025-05-31', website: 'https://www.sasolbursaries.com/' },
  { id: 'discovery-health', name: 'Discovery Health Bursary', provider: 'Discovery', field: 'Health Sciences', amount: 'Tuition + stipend', closingDate: '2025-09-30', website: 'https://www.discovery.co.za/' },
  { id: 'oldmutual-fin', name: 'Old Mutual Bursary', provider: 'Old Mutual', field: 'Business & Finance', amount: 'Tuition + stipend', closingDate: '2025-08-31', website: 'https://www.oldmutual.co.za/' },
  { id: 'bankseta-fin', name: 'BANKSETA Bursary', provider: 'BANKSETA', field: 'Business & Finance', amount: 'Tuition support', closingDate: '2025-09-30', website: 'https://www.bankseta.org.za/' },
  { id: 'agri-agri', name: 'Agriculture Bursary', provider: 'Department of Agriculture', field: 'Agriculture', amount: 'Tuition + allowances', closingDate: '2025-08-15', website: 'https://www.dalrrd.gov.za/' },
  { id: 'it-ms', name: 'Microsoft SA Bursary', provider: 'Microsoft', field: 'Information Technology', amount: 'Tuition + stipend', closingDate: '2025-07-31', website: 'https://www.microsoft.com/' },
  { id: 'edu-funed', name: 'Funza Lushaka Bursary', provider: 'DBE', field: 'Education', amount: 'Full bursary', closingDate: '2025-01-15', website: 'https://www.funzalushaka.doe.gov.za/' },
  { id: 'law-justice', name: 'Justice Department Bursary', provider: 'DoJ', field: 'Law', amount: 'Tuition support', closingDate: '2025-09-30', website: 'https://www.justice.gov.za/' },
  { id: 'arts-nac', name: 'National Arts Council Bursary', provider: 'NAC', field: 'Arts & Humanities', amount: 'Grant-based', closingDate: '2025-06-30', website: 'https://www.nac.org.za/' },
  { id: 'science-csir', name: 'CSIR Bursary', provider: 'CSIR', field: 'Science', amount: 'Full bursary', closingDate: '2025-08-31', website: 'https://www.csir.co.za/' }
];

export const isOpen = (closingDate, now = new Date()) => {
  try {
    const d = new Date(closingDate);
    return d >= now;
  } catch {
    return true;
  }
};

export const getOpenBursaries = (now = new Date()) => BURSARIES.filter(b => isOpen(b.closingDate, now));

export const getOpenBursariesByField = (field, now = new Date()) => {
  const normalized = (field || '').toLowerCase();
  return getOpenBursaries(now).filter(b => 
    b.field === 'All' || b.field.toLowerCase() === normalized
  );
};

// Placeholder for future web integration
export async function fetchBursariesFromWeb() {
  // To integrate bursariesza, implement a backend endpoint that scrapes or uses their feed,
  // then call it from here (avoid client-side CORS and scraping constraints).
  return getOpenBursaries();
}