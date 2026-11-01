/**
 * Utilitários de Cálculo de Datas e Idades Clínicas
 * Odonto Souza — Frontend Clinical Architecture
 */

/**
 * Calcula a idade com precisão clínica a partir de uma data de nascimento.
 * Suporta formatos:
 * - YYYY-MM-DD (padrão input type="date" e ISO)
 * - DD/MM/YYYY (formato brasileiro comum)
 * - ISO strings com timestamp (ex: 1982-07-13T00:00:00.000Z)
 * 
 * Evita desvios de fuso horário UTC midnight que poderiam subtrair um dia.
 */
export function calculateAge(birthDateStr?: string | null): number {
  if (!birthDateStr || typeof birthDateStr !== 'string') {
    return 0;
  }

  const cleanStr = birthDateStr.trim();
  if (!cleanStr) return 0;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 6 = Jul, 9 = Out)
  const currentDay = today.getDate();

  // Formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss
  if (cleanStr.includes('-')) {
    const datePart = cleanStr.split('T')[0];
    const parts = datePart.split('-').map((v) => parseInt(v, 10));
    if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const birthYear = parts[0];
      const birthMonth = parts[1] - 1; // 0-indexed
      const birthDay = parts[2];

      let age = currentYear - birthYear;
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--;
      }
      return Math.max(0, age);
    }
  }

  // Formato brasileiro DD/MM/YYYY
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/').map((v) => parseInt(v, 10));
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const birthDay = parts[0];
      const birthMonth = parts[1] - 1;
      const birthYear = parts[2];

      let age = currentYear - birthYear;
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--;
      }
      return Math.max(0, age);
    }
  }

  // Fallback para construtor Date
  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    let age = currentYear - parsed.getFullYear();
    const m = currentMonth - parsed.getMonth();
    if (m < 0 || (m === 0 && currentDay < parsed.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  return 0;
}
