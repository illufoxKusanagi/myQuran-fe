/**
 * Utility for normalizing and matching Arabic-Latin transliteration
 * Supports Indonesian Kemenag standard, IJMES, and common colloquial spelling.
 */

const DIACRITIC_MAP: Record<string, string> = {
  // Macrons & Vowels
  ā: 'a',
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  å: 'a',
  ī: 'i',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  ū: 'u',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ü: 'u',
  ē: 'e',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ō: 'o',
  ò: 'o',
  ó: 'o',
  ô: 'o',
  ö: 'o',

  // Consonants with under-dots, macrons, or diacritics
  ḍ: 'd',
  ḑ: 'd',
  ṣ: 's',
  ṡ: 's',
  š: 's',
  ś: 's',
  ṭ: 't',
  ţ: 't',
  ẓ: 'z',
  ż: 'z',
  ź: 'z',
  ž: 'z',
  ḥ: 'h',
  ḫ: 'h',
  ṯ: 't',
  ḏ: 'd',
  ñ: 'n',
};

// Regex to strip Arabic prefixes: al-, an-, ar-, as-, at-, az-, ad-, adz-, ash-, asy-
const PREFIX_REGEX =
  /^(?:al|an|ar|as|at|az|ad|adz|ash|asy|al-|an-|ar-|as-|at-|az-|ad-|adz-|ash-|asy-)\s*/i;

/**
 * Normalizes an Arabic transliterated string into a plain lowercase ASCII string.
 * Strips macrons, under-dots, apostrophes, and standardizes spacing.
 */
export function normalizeTransliteration(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase();

  // Replace explicit mapping
  normalized = normalized.replace(
    /[āàáâãäåīìíîïūùúûüēèéêëōòóôöḍḑṣṡšśṭţẓżźžḥḫṯḏñ]/g,
    (match) => DIACRITIC_MAP[match] || match
  );

  // Unicode NFD decomposition to catch any remaining combining accents
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Strip apostrophes, glottal stops, and quotes (' ’ ‘ ʻ ʼ ` ")
  normalized = normalized.replace(/['’‘ʻʼ`"]/g, '');

  // Replace hyphens and underscores with a space
  normalized = normalized.replace(/[-_]/g, ' ');

  // Collapse multiple whitespace
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Strips common Arabic definite article prefixes (al-, an-, ar-, etc.)
 * from a normalized string.
 * e.g. "an nisa" -> "nisa", "al baqarah" -> "baqarah"
 */
export function stripArabicPrefix(normalizedText: string): string {
  return normalizedText.replace(PREFIX_REGEX, '').trim();
}

/**
 * Checks if a target string matches a search query using transliteration normalization.
 * Matches:
 * 1. Normalized target contains normalized query
 * 2. Prefix-stripped target contains prefix-stripped query
 * 3. Exact target contains exact query
 */
export function matchesTransliteration(target: string, query: string): boolean {
  if (!query) return true;
  if (!target) return false;

  const normTarget = normalizeTransliteration(target);
  const normQuery = normalizeTransliteration(query);

  if (!normQuery) return true;

  // 1. Direct normalized match (e.g. "an nisa" contains "nisa")
  if (normTarget.includes(normQuery)) {
    return true;
  }

  // 2. Compact match (no spaces, e.g. "annisa" matches "an nisa")
  const compactTarget = normTarget.replace(/\s+/g, '');
  const compactQuery = normQuery.replace(/\s+/g, '');
  if (compactTarget.includes(compactQuery)) {
    return true;
  }

  // 3. Prefix-stripped match (e.g. target "An-Nisā'" -> "nisa", query "nisa")
  const coreTarget = stripArabicPrefix(normTarget);
  const coreQuery = stripArabicPrefix(normQuery);

  if (coreTarget.includes(coreQuery) || coreTarget.includes(normQuery)) {
    return true;
  }

  return false;
}
