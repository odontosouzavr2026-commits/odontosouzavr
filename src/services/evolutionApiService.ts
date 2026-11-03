// Serviço de Integração com a Evolution API (WhatsApp)
// Endpoints oficiais da Evolution API v2: https://docs.evolutionfoundation.com.br/evolution-api

export interface EvolutionInstanceInfo {
  id?: string;
  name: string;
  connectionStatus: 'open' | 'connecting' | 'close' | 'refused';
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string | null;
  integration?: string;
  count?: {
    message: number;
    contact: number;
    chat: number;
  };
}

export interface SendMessageResponse {
  key?: {
    remoteJid?: string;
    fromMe?: boolean;
    id?: string;
  };
  message?: any;
  status?: string;
  [key: string]: any;
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
}

const DEFAULT_URL = (import.meta.env?.VITE_EVOLUTION_API_URL as string) || 'https://painelevolution.odontosouzavr.com.br';
const DEFAULT_KEY = (import.meta.env?.VITE_EVOLUTION_API_KEY as string) || '';
const DEFAULT_INSTANCE = (import.meta.env?.VITE_EVOLUTION_INSTANCE as string) || 'atendimento';

export const evolutionApiService = {
  getBaseUrl(): string {
    const saved = localStorage.getItem('odonto_evo_api_url');
    return (saved || DEFAULT_URL).replace(/\/+$/, '');
  },

  setBaseUrl(url: string): void {
    localStorage.setItem('odonto_evo_api_url', url.trim());
  },

  getApiKey(): string {
    const saved = localStorage.getItem('odonto_evo_api_key');
    return saved || DEFAULT_KEY;
  },

  setApiKey(key: string): void {
    localStorage.setItem('odonto_evo_api_key', key.trim());
  },

  getInstanceName(): string {
    const saved = localStorage.getItem('odonto_evo_instance');
    return saved || DEFAULT_INSTANCE;
  },

  setInstanceName(instance: string): void {
    localStorage.setItem('odonto_evo_instance', instance.trim());
  },

  getHeaders(): HeadersInit {
    return {
      'apikey': this.getApiKey(),
      'Content-Type': 'application/json; charset=utf-8',
    };
  },

  // 1. Verifica o Estado de Conexão da Instância
  async getConnectionState(instance?: string): Promise<{ state: 'open' | 'connecting' | 'close' | 'refused'; instanceName: string }> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/instance/connectionState/${target}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const state = data?.instance?.state || (data?.state === 'open' ? 'open' : 'close');
      return {
        state: state as 'open' | 'connecting' | 'close' | 'refused',
        instanceName: target,
      };
    } catch (err: any) {
      console.warn('[evolutionApiService.getConnectionState] Erro:', err.message);
      return {
        state: 'close',
        instanceName: target,
      };
    }
  },

  // 2. Busca Detalhes Completos da Instância (Perfil, Telefone, Contadores)
  async fetchInstanceDetails(instance?: string): Promise<EvolutionInstanceInfo | null> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/instance/fetchInstances`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const list = await res.json();
      if (!Array.isArray(list)) return null;

      const found = list.find((item: any) => item.name === target);
      if (!found) return null;

      return {
        id: found.id,
        name: found.name,
        connectionStatus: found.connectionStatus || 'close',
        ownerJid: found.ownerJid,
        profileName: found.profileName,
        profilePicUrl: found.profilePicUrl,
        integration: found.integration,
        count: {
          message: found._count?.Message || 0,
          contact: found._count?.Contact || 0,
          chat: found._count?.Chat || 0,
        },
      };
    } catch (err: any) {
      console.warn('[evolutionApiService.fetchInstanceDetails] Erro:', err.message);
      return null;
    }
  },

  // 3. Conectar ou Obter QR Code / Pairing Code
  async connectInstance(instance?: string): Promise<{ base64?: string; code?: string; pairingCode?: string }> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/instance/connect/${target}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        base64: data?.base64,
        code: data?.code,
        pairingCode: data?.pairingCode,
      };
    } catch (err: any) {
      console.error('[evolutionApiService.connectInstance] Erro:', err.message);
      throw err;
    }
  },

  // 4. Reiniciar Instância
  async restartInstance(instance?: string): Promise<any> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/instance/restart/${target}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.error('[evolutionApiService.restartInstance] Erro:', err.message);
      throw err;
    }
  },

  // 5. Desconectar / Fazer Logout da Instância
  async logoutInstance(instance?: string): Promise<any> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/instance/logout/${target}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.error('[evolutionApiService.logoutInstance] Erro:', err.message);
      throw err;
    }
  },

  // 6. Enviar Mensagem de Texto
  async sendTextMessage(
    recipient: string,
    text: string,
    instance?: string
  ): Promise<SendMessageResponse> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/message/sendText/${target}`;

    // Sanitiza número: apenas dígitos. Se não tiver DDI (55), adiciona.
    let cleanNumber = recipient.replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = '55' + cleanNumber;
    }

    const payload = {
      number: cleanNumber,
      text: text.trim(),
      options: {
        delay: 1200,
        presence: 'composing',
        linkPreview: true,
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.response?.message?.[0] || data?.message || `HTTP ${res.status}`);
      }

      return data;
    } catch (err: any) {
      console.error('[evolutionApiService.sendTextMessage] Erro:', err.message);
      throw err;
    }
  },

  // 6.1 Enviar Mensagem com Botões Interativos Oficiais (Quick Reply SIM / NÃO)
  async sendButtons(
    recipient: string,
    title: string,
    description: string,
    buttons: Array<{ id: string; displayText: string }>,
    footer: string = 'Odonto Souza Odontologia Especializada',
    instance?: string
  ): Promise<any> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/message/sendButtons/${target}`;

    let cleanNumber = recipient.replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = '55' + cleanNumber;
    }

    const payload = {
      number: cleanNumber,
      title: title.trim(),
      description: description.trim(),
      footer: footer.trim(),
      buttons: buttons.map((b) => ({
        type: 'reply',
        displayText: b.displayText,
        id: b.id,
      })),
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.response?.message?.[0] || data?.message || `HTTP ${res.status}`);
      }

      return data;
    } catch (err: any) {
      console.error('[evolutionApiService.sendButtons] Erro:', err.message);
      throw err;
    }
  },

  // 7. Buscar Configuração de Webhook da Instância
  async getWebhook(instance?: string): Promise<any> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/webhook/find/${target}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err: any) {
      console.warn('[evolutionApiService.getWebhook] Erro:', err.message);
      return null;
    }
  },

  // 8. Salvar Configuração de Webhook
  async setWebhook(
    webhookUrl: string,
    enabled: boolean,
    events: string[],
    instance?: string
  ): Promise<any> {
    const target = instance || this.getInstanceName();
    const url = `${this.getBaseUrl()}/webhook/set/${target}`;

    const payload = {
      webhook: {
        enabled,
        url: webhookUrl.trim(),
        webhookByEvents: false,
        events,
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      return data;
    } catch (err: any) {
      console.error('[evolutionApiService.setWebhook] Erro:', err.message);
      throw err;
    }
  },
};
