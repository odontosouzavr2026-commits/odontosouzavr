/**
 * Utilitários de Validação Matemática e Formatação de Documentos Brasileiros
 * Odonto Souza — Frontend Clinical Architecture
 */

/**
 * Remove qualquer caractere não numérico de uma string.
 */
export function cleanDigits(value: string = ''): string {
  return value.replace(/\D/g, '');
}

/**
 * Validação matemática estrita de CPF com cálculo dos 2 dígitos verificadores (módulo 11).
 * Rejeita CPFs com menos/mais de 11 dígitos ou sequências de dígitos idênticos (ex: 111.111.111-11).
 */
export function isValidCPF(cpf: string = ''): boolean {
  const digits = cleanDigits(cpf);

  // CPF deve conter exatamente 11 dígitos numéricos
  if (digits.length !== 11) {
    return false;
  }

  // Elimina sequências conhecidas de dígitos todos iguais (00000000000, 11111111111, etc.)
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  // 1º Dígito Verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let firstCheckDigit = (sum * 10) % 11;
  if (firstCheckDigit === 10 || firstCheckDigit === 11) {
    firstCheckDigit = 0;
  }
  if (firstCheckDigit !== parseInt(digits.charAt(9), 10)) {
    return false;
  }

  // 2º Dígito Verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  let secondCheckDigit = (sum * 10) % 11;
  if (secondCheckDigit === 10 || secondCheckDigit === 11) {
    secondCheckDigit = 0;
  }
  if (secondCheckDigit !== parseInt(digits.charAt(10), 10)) {
    return false;
  }

  return true;
}

/**
 * Validação matemática estrita de CNPJ com cálculo dos 2 dígitos verificadores (módulo 11).
 * Rejeita CNPJs com menos/mais de 14 dígitos ou sequências de dígitos idênticos.
 */
export function isValidCNPJ(cnpj: string = ''): boolean {
  const digits = cleanDigits(cnpj);

  // CNPJ deve ter exatamente 14 dígitos
  if (digits.length !== 14) {
    return false;
  }

  // Rejeita sequências de dígitos repetidos (ex: 00000000000000, 11111111111111)
  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  // 1º Dígito Verificador
  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits.charAt(i), 10) * weightsFirst[i];
  }
  const remainderFirst = sum % 11;
  const firstCheckDigit = remainderFirst < 2 ? 0 : 11 - remainderFirst;
  if (firstCheckDigit !== parseInt(digits.charAt(12), 10)) {
    return false;
  }

  // 2º Dígito Verificador
  const weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits.charAt(i), 10) * weightsSecond[i];
  }
  const remainderSecond = sum % 11;
  const secondCheckDigit = remainderSecond < 2 ? 0 : 11 - remainderSecond;
  if (secondCheckDigit !== parseInt(digits.charAt(13), 10)) {
    return false;
  }

  return true;
}

/**
 * Máscara visual de formatação de CPF: 000.000.000-00
 */
export function formatCPF(value: string = ''): string {
  let raw = cleanDigits(value).slice(0, 11);
  if (raw.length > 9) {
    return raw.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
  } else if (raw.length > 6) {
    return raw.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
  } else if (raw.length > 3) {
    return raw.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
  }
  return raw;
}

/**
 * Máscara visual de formatação de CNPJ: 00.000.000/0000-00
 */
export function formatCNPJ(value: string = ''): string {
  let raw = cleanDigits(value).slice(0, 14);
  if (raw.length > 12) {
    return raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
  } else if (raw.length > 8) {
    return raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
  } else if (raw.length > 5) {
    return raw.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3');
  } else if (raw.length > 2) {
    return raw.replace(/^(\d{2})(\d{1,3})$/, '$1.$2');
  }
  return raw;
}

/**
 * Formata dinamicamente para CPF ou CNPJ conforme o número de dígitos inseridos.
 */
export function formatCPFOrCNPJ(value: string = ''): string {
  const digits = cleanDigits(value);
  return digits.length > 11 ? formatCNPJ(digits) : formatCPF(digits);
}

/**
 * Validação de CPF ou CNPJ dependendo do comprimento dos dígitos.
 */
export function isValidCPFOrCNPJ(value: string = ''): boolean {
  const digits = cleanDigits(value);
  if (digits.length <= 11) {
    return isValidCPF(digits);
  }
  return isValidCNPJ(digits);
}

/**
 * Máscara visual de formatação de Telefone / Celular Brasileiro:
 * - Fixo (10 dígitos): (00) 0000-0000
 * - Celular / WhatsApp (11 dígitos): (00) 00000-0000
 */
export function formatPhone(value: string = ''): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length > 10) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (digits.length > 6) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (digits.length > 2) {
    return digits.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  } else if (digits.length > 0) {
    return digits.replace(/^(\d*)$/, '($1');
  }
  return '';
}

/**
 * Validação de telefone brasileiro (10 dígitos para fixo ou 11 dígitos para celular).
 */
export function isValidPhone(value: string = ''): boolean {
  const digits = cleanDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits.charAt(2) !== '9') return false;
  return true;
}

/**
 * Aplica máscara genérica conforme o tipo solicitado.
 */
export function applyMask(value: string = '', maskType: 'cpf' | 'cnpj' | 'cpf_cnpj' | 'phone' | 'cep'): string {
  switch (maskType) {
    case 'cpf':
      return formatCPF(value);
    case 'cnpj':
      return formatCNPJ(value);
    case 'cpf_cnpj':
      return formatCPFOrCNPJ(value);
    case 'phone':
      return formatPhone(value);
    case 'cep': {
      const raw = cleanDigits(value).slice(0, 8);
      if (raw.length > 5) {
        return raw.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
      }
      return raw;
    }
    default:
      return value;
  }
}

