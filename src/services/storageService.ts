/**
 * Serviço de Gerenciamento do S3 Contabo Object Storage
 * Organização Hierárquica: {ANO}/{MÊS}/{ID_PACIENTE}/{CATEGORIA}/{ARQUIVO}
 * Ciclo de Vida: Upload seguro, limpeza de arquivos substituídos e exclusão completa
 */

export type StorageCategoria = 'perfil' | 'exames' | 'documentos' | 'radiografias' | 'receitas' | 'institucional';

export interface StorageUploadParams {
  file: File | Blob | string; // Suporta File/Blob ou Data URL (base64)
  pacienteId: string;
  categoria: StorageCategoria;
  filename?: string;
  ano?: string;
  mes?: string;
}

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  bucket?: string;
  size?: number;
  error?: string;
}

export interface StorageDeleteResult {
  success: boolean;
  message?: string;
  deletedKey?: string;
  deletedCount?: number;
  error?: string;
}

// Converte File ou Blob para Base64 Data URL
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const storageService = {
  /**
   * Envia um arquivo (foto de perfil, exame, documento) para o bucket S3 da Contabo
   * com estrutura hierárquica automática {ANO}/{MÊS}/{ID_PACIENTE}/{CATEGORIA}/
   */
  async uploadArquivo(params: StorageUploadParams): Promise<StorageUploadResult> {
    try {
      let base64String = '';
      let detectedName = params.filename || '';
      let detectedMime = 'application/octet-stream';

      if (typeof params.file === 'string') {
        base64String = params.file;
        if (params.file.startsWith('data:image/png')) detectedMime = 'image/png';
        else if (params.file.startsWith('data:image/jpeg')) detectedMime = 'image/jpeg';
        else if (params.file.startsWith('data:application/pdf')) detectedMime = 'application/pdf';
      } else {
        base64String = await fileToBase64(params.file);
        detectedMime = params.file.type || detectedMime;
        if (!detectedName && 'name' in params.file) {
          detectedName = (params.file as File).name;
        }
      }

      const payload = {
        fileBase64: base64String,
        pacienteId: params.pacienteId,
        categoria: params.categoria,
        filename: detectedName,
        contentType: detectedMime,
        ano: params.ano,
        mes: params.mes,
      };

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao salvar no storage da Contabo');
      }

      return {
        success: true,
        url: data.url,
        key: data.key,
        bucket: data.bucket,
        size: data.size,
      };
    } catch (err: any) {
      console.error('[storageService.uploadArquivo] Erro:', err);
      return {
        success: false,
        error: err?.message || 'Erro de conexão com o storage.',
      };
    }
  },

  /**
   * Exclui um arquivo do bucket Contabo (por Key ou por URL completa)
   * Garante que não fiquem arquivos órfãos ao deletar anexos ou substituir fotos
   */
  async deleteArquivo(keyOrUrl: string): Promise<StorageDeleteResult> {
    try {
      if (!keyOrUrl) return { success: true };

      // Se não for um arquivo do storage Contabo, ignora
      if (!keyOrUrl.includes('contabostorage.com') && !keyOrUrl.includes('/')) {
        return { success: true };
      }

      const response = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: keyOrUrl.startsWith('http') ? keyOrUrl : undefined,
          key: !keyOrUrl.startsWith('http') ? keyOrUrl : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.warn('[storageService.deleteArquivo] Aviso ao excluir:', data.error);
        return { success: false, error: data.error };
      }

      return {
        success: true,
        message: data.message,
        deletedKey: data.deletedKey,
      };
    } catch (err: any) {
      console.warn('[storageService.deleteArquivo] Erro na requisição:', err);
      return {
        success: false,
        error: err?.message || 'Erro ao conectar ao serviço de exclusão.',
      };
    }
  },

  /**
   * Remove toda a pasta e todos os arquivos pertencentes a um paciente
   * Disparado quando um paciente é excluído do sistema clínico
   */
  async deletePastaPaciente(pacienteId: string, ano?: string, mes?: string): Promise<StorageDeleteResult> {
    try {
      if (!pacienteId) return { success: true };

      const response = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pacienteId,
          ano,
          mes,
          fullCleanup: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.warn('[storageService.deletePastaPaciente] Aviso ao limpar pasta:', data.error);
        return { success: false, error: data.error };
      }

      return {
        success: true,
        message: data.message,
        deletedCount: data.deletedCount,
      };
    } catch (err: any) {
      console.warn('[storageService.deletePastaPaciente] Erro:', err);
      return {
        success: false,
        error: err?.message || 'Erro ao comunicar com serviço de limpeza de pasta.',
      };
    }
  },
};
