/**
 * Utility for generating secure, unpredictable Team Access Codes.
 * Example output: REX-7K4P9X
 */
export function generateTeamCode(prefix: string = 'REX'): string {
  // Exclude ambiguous characters (0, O, 1, I, L)
  const charset = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let randomPart = '';
  
  // Use crypto API if available
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(6);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 6; i++) {
      randomPart += charset[array[i] % charset.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      randomPart += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }

  return `${prefix.toUpperCase()}-${randomPart}`;
}

export function isValidTeamCodeFormat(code: string): boolean {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();
  return /^REX-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(cleanCode);
}
