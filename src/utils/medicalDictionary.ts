/**
 * A comprehensive list of protected medical terms, drugs, abbreviations, and units
 * that should NEVER be translated.
 */
export const PROTECTED_MEDICAL_TERMS = [
  "Creatinine",
  "Troponin",
  "Aspirin",
  "Paracetamol",
  "Metformin",
  "HbA1c",
  "ECG",
  "EKG",
  "MRI",
  "CT",
  "PET",
  "COPD",
  "STEMI",
  "NSTEMI",
  "ARDS",
  "ACE Inhibitor",
  "ARB",
  "Statin",
  "Insulin",
  "DNA",
  "RNA",
  "ATP",
  "CBC",
  "BMP",
  "LFTs",
  "TSH",
  "HIV"
];

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates a RegExp that matches any of the protected terms as whole words.
 */
export function getProtectedTermsRegex() {
  const joined = PROTECTED_MEDICAL_TERMS.map(escapeRegExp).join('|');
  return new RegExp(`\\b(${joined})\\b`, 'gi');
}
