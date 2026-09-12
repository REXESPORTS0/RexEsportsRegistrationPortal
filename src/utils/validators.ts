export interface ValidationError {
  field: string;
  message: string;
}

export function validateTeamName(name: string): string | null {
  if (!name || !name.trim()) return 'Team name is required';
  if (name.trim().length < 2) return 'Team name must be at least 2 characters';
  if (name.trim().length > 30) return 'Team name cannot exceed 30 characters';
  return null;
}

export function validateIGN(ign: string, label: string = 'In-game name'): string | null {
  if (!ign || !ign.trim()) return `${label} is required`;
  if (ign.trim().length < 2) return `${label} must be at least 2 characters`;
  if (ign.trim().length > 20) return `${label} cannot exceed 20 characters`;
  return null;
}

export function validateUID(uid: string, label: string = 'BGMI UID'): string | null {
  if (!uid || !uid.trim()) return `${label} is required`;
  const cleanUid = uid.trim();
  if (!/^\d{5,12}$/.test(cleanUid)) {
    return `${label} must be between 5 and 12 numeric digits`;
  }
  return null;
}

export function validateContact(contact: string): string | null {
  if (!contact || !contact.trim()) return 'Captain contact number is required';
  const cleanContact = contact.trim().replace(/[\s\-\+\(\)]/g, '');
  if (!/^\d{10,12}$/.test(cleanContact)) {
    return 'Enter a valid 10-digit mobile phone number';
  }
  return null;
}

export function validateEmail(email?: string): string | null {
  if (!email || !email.trim()) return null; // Email optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Enter a valid email address';
  }
  return null;
}
