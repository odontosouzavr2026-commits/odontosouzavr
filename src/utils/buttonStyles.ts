/**
 * Padrão Oficial de Botões do Sistema OdontoSouza
 * 
 * Regras visuais estritas:
 * - Importar: Fundo Azul, Fonte Branco e Negrito (hover: -20% de opacidade)
 * - Exportar: Fundo Laranja, Fonte Branco e Negrito (hover: -20% de opacidade)
 * - Ações de Registro (Tabelas e Cards):
 *   - Ver: Azul (text-blue-600)
 *   - Editar: Laranja (text-amber-500)
 *   - Excluir: Vermelho (text-rose-600)
 */

export const BTN_IMPORTAR_CLASS =
  'inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:opacity-80 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-2xs transition-opacity cursor-pointer';

export const BTN_EXPORTAR_CLASS =
  'inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:opacity-80 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-2xs transition-opacity cursor-pointer';

export const ACTION_BUTTON_CLASSES = {
  view: 'p-1.5 rounded-lg text-blue-600 hover:opacity-80 transition-opacity cursor-pointer',
  edit: 'p-1.5 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer',
  delete: 'p-1.5 rounded-lg text-rose-600 hover:opacity-80 transition-opacity cursor-pointer',
} as const;
