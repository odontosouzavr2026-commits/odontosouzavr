/**
 * Serviço de Integração ViaCEP — Autopreenchimento e Validação de Endereços
 * Odonto Souza — Frontend Clinical Architecture
 */

import { cleanDigits } from '../utils/documentValidation';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;         // Estado
  ibge?: string;
  ddd?: string;
  erro?: boolean | string;
}

export class ViaCepError extends Error {
  constructor(message: string = 'CEP não encontrado ou inválido') {
    super(message);
    this.name = 'ViaCepError';
  }
}

/**
 * Consulta a API pública do ViaCEP e retorna os dados de endereço higienizados.
 * Dispara ViaCepError em caso de CEP inexistente ({ erro: true }) ou falha de rede.
 */
export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse> {
  const clean = cleanDigits(cep);

  if (clean.length !== 8) {
    throw new ViaCepError('CEP não encontrado ou inválido');
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ViaCepError('CEP não encontrado ou inválido');
    }

    const data: ViaCepResponse = await response.json();

    // ViaCEP retorna { erro: true } ou { erro: "true" } para CEPs inexistentes
    if (data.erro === true || data.erro === 'true') {
      throw new ViaCepError('CEP não encontrado ou inválido');
    }

    return data;
  } catch (err: any) {
    if (err instanceof ViaCepError) {
      throw err;
    }
    // Falhas de rede ou timeout
    throw new ViaCepError('CEP não encontrado ou inválido');
  }
}

/**
 * Formata máscara de CEP: 00000-000
 */
export function formatCEP(value: string = ''): string {
  const raw = cleanDigits(value).slice(0, 8);
  if (raw.length > 5) {
    return raw.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
  }
  return raw;
}
