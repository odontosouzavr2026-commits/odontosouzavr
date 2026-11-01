import { useState, useCallback } from 'react';
import { fetchAddressByCep, ViaCepResponse } from '../services/cepService';
import { cleanDigits } from '../utils/documentValidation';

interface UseViaCepReturn {
  loading: boolean;
  error: boolean;
  errorMessage: string;
  lookupCep: (rawCep: string) => Promise<ViaCepResponse | null>;
  clearCepError: () => void;
}

export function useViaCep(): UseViaCepReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const clearCepError = useCallback(() => {
    setError(false);
    setErrorMessage('');
  }, []);

  const lookupCep = useCallback(
    async (rawCep: string): Promise<ViaCepResponse | null> => {
      const clean = cleanDigits(rawCep);

      // Só consulta se tiver os 8 dígitos completos
      if (clean.length !== 8) {
        if (clean.length > 0) {
          setError(true);
          setErrorMessage('CEP não encontrado ou inválido');
        } else {
          clearCepError();
        }
        return null;
      }

      setLoading(true);
      setError(false);
      setErrorMessage('');

      try {
        const address = await fetchAddressByCep(clean);
        setLoading(false);
        setError(false);
        setErrorMessage('');
        return address;
      } catch (err: any) {
        setLoading(false);
        setError(true);
        setErrorMessage('CEP não encontrado ou inválido');
        return null;
      }
    },
    [clearCepError]
  );

  return {
    loading,
    error,
    errorMessage,
    lookupCep,
    clearCepError,
  };
}
