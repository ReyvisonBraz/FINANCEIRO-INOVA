export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

export function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 11) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

export function formatWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('55') && clean.length === 13) {
    return `+${clean}`;
  }
  if (clean.length === 11) {
    return `+55${clean}`;
  }
  return phone;
}
