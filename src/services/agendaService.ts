import { supabase } from '../lib/supabase';
import { AgendaAppointmentItem, AppointmentScheduleStatus } from '../types/agenda';
import { whatsappNotificationService } from './whatsappNotificationService';
import { emitirNotificacaoClinica } from '../contexts/NotificationContext';

// Validador estrito de formato UUID v4 / v1 para PostgreSQL
function isValidUUID(value: any): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

export const agendaService = {
  async getAgendamentos(): Promise<AgendaAppointmentItem[]> {
    try {
      const { data, error } = await supabase.rpc('obter_agendamentos');
      let rawData = data;

      if (error || !rawData) {
        console.warn('[agendaService.getAgendamentos] Erro RPC, buscando via tabela:', error?.message);
        const { data: directData, error: directError } = await supabase
          .from('agendamentos')
          .select(`
            id,
            paciente_id,
            dentista_id,
            cadeira_id,
            procedimento_id,
            data_hora_inicio,
            data_hora_fim,
            status,
            tipo,
            observacoes,
            criado_em,
            pacientes (id, nome, telefone, cpf, convenio),
            procedimentos (id, nome, preco_base)
          `)
          .order('data_hora_inicio', { ascending: true });

        if (directError) {
          console.error('[agendaService.getAgendamentos] Erro query direta:', directError.message);
          return [];
        }

        rawData = (directData || []).map((d: any) => ({
          id: d.id,
          paciente_id: d.paciente_id,
          paciente_nome: d.pacientes?.nome,
          paciente_telefone: d.pacientes?.telefone,
          paciente_cpf: d.pacientes?.cpf,
          paciente_convenio: d.pacientes?.convenio,
          procedimento_id: d.procedimento_id,
          procedimento_nome: d.procedimentos?.nome,
          procedimento_preco: d.procedimentos?.preco_base,
          data_hora_inicio: d.data_hora_inicio,
          data_hora_fim: d.data_hora_fim,
          status: d.status,
          tipo: d.tipo,
          observacoes: d.observacoes,
          criado_em: d.criado_em,
        }));
      }

      if (!rawData || !Array.isArray(rawData)) return [];

      return rawData.map((a: any) => {
        const startDate = new Date(a.data_hora_inicio);
        const y = startDate.getFullYear();
        const m = String(startDate.getMonth() + 1).padStart(2, '0');
        const d = String(startDate.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${d}`;

        const timeStr = startDate.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const endDate = a.data_hora_fim ? new Date(a.data_hora_fim) : null;
        const endTimeStr = endDate
          ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : undefined;

        const durationMinutes = endDate
          ? Math.max(15, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
          : 45;

        const rawStatus = (a.status || '').toLowerCase();
        let status: AppointmentScheduleStatus = 'Confirmado';
        if (rawStatus.includes('finalizado') || rawStatus.includes('conclu')) status = 'Concluído';
        else if (rawStatus.includes('atendimento')) status = 'Em Atendimento';
        else if (rawStatus.includes('cancel') || rawStatus.includes('falta') || rawStatus.includes('desmarc')) status = 'Desmarcou';
        else if (rawStatus.includes('bloque')) status = 'Bloqueado';
        else if (rawStatus.includes('encaixe') || a.tipo === 'Encaixe') status = 'Encaixe de Urgência';
        else if (rawStatus.includes('espera')) status = 'Confirmado';

        const isUrgent =
          a.tipo === 'Encaixe' ||
          rawStatus.includes('encaixe') ||
          rawStatus.includes('urgência') ||
          rawStatus.includes('urgencia') ||
          (a.observacoes && a.observacoes.toLowerCase().includes('encaixe')) ||
          (a.observacoes && a.observacoes.toLowerCase().includes('urgência'));

        const isSurgery =
          (a.procedimento_nome || '').toLowerCase().includes('implante') ||
          (a.procedimento_nome || '').toLowerCase().includes('siso') ||
          (a.procedimento_nome || '').toLowerCase().includes('cirurgia');

        let actionButtonLabel: string | undefined = undefined;
        if (status === 'Em Atendimento') actionButtonLabel = 'Acessar Atendimento';
        else if (isUrgent) actionButtonLabel = 'Chamar p/ Cadeira';
        else if (isSurgery) actionButtonLabel = 'Ficha Pré-Op';

        return {
          id: a.id,
          pacienteId: a.paciente_id,
          procedimentoId: a.procedimento_id,
          dentistaId: a.dentista_id,
          date: dateKey,
          time: timeStr || '09:00',
          endTime: endTimeStr,
          duration: `${durationMinutes} min`,
          patientName: a.paciente_nome || 'Paciente sem nome',
          phone: a.paciente_telefone || undefined,
          cpf: a.paciente_cpf || undefined,
          procedure: a.procedimento_nome || 'Consulta Odontológica',
          insurance: a.paciente_convenio || 'Particular',
          status,
          whatsappConfirmed: true,
          isSurgery,
          isEncaixe: isUrgent,
          notes: a.observacoes || undefined,
          actionButtonLabel,
          createdAt: a.criado_em,
        };
      });
    } catch (err) {
      console.error('[agendaService.getAgendamentos] Exceção:', err);
      return [];
    }
  },

  async getAgendamentosPorData(dateStr: string): Promise<AgendaAppointmentItem[]> {
    const todos = await this.getAgendamentos();
    return todos.filter((a) => a.date === dateStr);
  },

  /**
   * Valida regras clínicas de prevenção estrita de conflitos (Double Booking):
   * 1. Um paciente NUNCA pode ter dois agendamentos no mesmo horário (sobreposição).
   * 2. Uma cadeira / consultório NUNCA pode ter dois atendimentos no mesmo horário.
   * 3. Um paciente não pode marcar dois horários no mesmo dia, a não ser que o horário
   *    anterior já esteja concluído e o novo horário seja diferente.
   */
  async verificarConflitoDuploAgendamento(
    pacienteNomeOuId: string,
    dateStr: string,
    currentAgendamentoId?: string,
    novoHorarioInicio?: Date,
    novoHorarioFim?: Date,
    pacienteEmail?: string
  ): Promise<{ permitido: boolean; motivo?: string }> {
    try {
      if (!pacienteNomeOuId || !dateStr) return { permitido: true };
      const agendamentos = await this.getAgendamentosPorData(dateStr);
      const cleanSearch = (pacienteNomeOuId || '').toLowerCase().trim();
      const cleanEmail = (pacienteEmail || '').toLowerCase().trim();

      // Paciente de Teste Homologado: everaldozspaciente@gmail.com
      // Isento do limite diário de consultas para fins de demonstração e testes da clínica
      const isTestPatient =
        cleanEmail === 'everaldozspaciente@gmail.com' ||
        cleanSearch === 'everaldozspaciente@gmail.com' ||
        cleanSearch === '1b594c6e-400f-4ca7-9a19-282de3ef8832' ||
        pacienteNomeOuId === '1b594c6e-400f-4ca7-9a19-282de3ef8832';

      // Checagem 1: Sobreposição exata de horários (mesmo paciente ou mesmo consultório)
      if (novoHorarioInicio && novoHorarioFim) {
        const newStartMs = novoHorarioInicio.getTime();
        const newEndMs = novoHorarioFim.getTime();

        for (const a of agendamentos) {
          if (currentAgendamentoId && a.id === currentAgendamentoId) continue;
          const st = (a.status || '').toLowerCase();
          // Ignora apenas agendamentos efetivamente cancelados ou desmarcados
          if (st.includes('cancel') || st.includes('desmarc') || st.includes('falta')) continue;

          let aStartMs: number;
          let aEndMs: number;
          if (a.dataHoraInicio) {
            aStartMs = new Date(a.dataHoraInicio).getTime();
            aEndMs = a.dataHoraFim ? new Date(a.dataHoraFim).getTime() : aStartMs + 45 * 60000;
          } else {
            const [h, m] = (a.time || '09:00').split(':').map(Number);
            const d = new Date(novoHorarioInicio);
            d.setHours(h, m, 0, 0);
            aStartMs = d.getTime();
            aEndMs = aStartMs + 45 * 60000;
          }

          // Verificação de colisão de intervalo [start, end]
          const isOverlap = newStartMs < aEndMs && newEndMs > aStartMs;
          if (isOverlap) {
            const matchId = a.pacienteId && a.pacienteId === pacienteNomeOuId;
            const matchName = a.patientName && a.patientName.toLowerCase().trim() === cleanSearch;

            if (matchId || matchName) {
              return {
                permitido: false,
                motivo: `Conflito Estrito de Horário: O paciente ${a.patientName} já possui um agendamento marcado para as ${a.time}. É expressamente proibido registrar dois agendamentos no mesmo horário.`,
              };
            }

            return {
              permitido: false,
              motivo: `Horário Indisponível: O horário das ${a.time} já está reservado para outro atendimento na clínica.`,
            };
          }
        }
      }

      // Checagem 2: Limite de consultas ativas no mesmo dia para o mesmo paciente
      // Usuário de teste homologado para apresentações e demonstrações clínicas
      if (isTestPatient) {
        return { permitido: true };
      }

      const agendamentosDoPaciente = agendamentos.filter((a) => {
        if (currentAgendamentoId && a.id === currentAgendamentoId) return false;
        const matchId = a.pacienteId && a.pacienteId === pacienteNomeOuId;
        const matchName = a.patientName && a.patientName.toLowerCase().trim() === cleanSearch;
        return matchId || matchName;
      });

      if (agendamentosDoPaciente.length === 0) {
        return { permitido: true };
      }

      // Se houver algum agendamento do paciente neste dia que NÃO seja 'Concluído' nem 'Desmarcou'
      const temNaoConcluido = agendamentosDoPaciente.some((a) => {
        const st = (a.status || '').toLowerCase();
        const isConcluido = st.includes('conclu') || st.includes('finaliz');
        const isDesmarcado = st.includes('cancel') || st.includes('desmarc') || st.includes('falta');
        return !isConcluido && !isDesmarcado;
      });

      if (temNaoConcluido) {
        return {
          permitido: false,
          motivo:
            'Regra Clínica: O paciente já possui uma consulta ativa nesta data. Não é permitido marcar dois horários no mesmo dia, exceto se a consulta anterior já estiver concluída.',
        };
      }

      return { permitido: true };
    } catch (err) {
      console.warn('[agendaService.verificarConflitoDuploAgendamento] Erro na checagem:', err);
      return { permitido: true };
    }
  },

  /**
   * Regra Exclusiva para o Portal do Paciente:
   * 1. Um paciente não pode marcar dois horários no mesmo dia.
   * 2. Um paciente não pode marcar duas consultas em um intervalo inferior a 7 dias (mínimo de 7 dias entre consultas).
   * 3. Exceção estrita: Não se aplica ao paciente de teste homologado 'everaldozspaciente@gmail.com'.
   * 4. Exclusivo para pacientes: Doutores e administradores na agenda da clínica são isentos dessa regra.
   */
  async verificarRegraAgendamentoPaciente(
    pacienteNomeOuId: string,
    targetDate: string | Date,
    pacienteEmail?: string,
    currentAgendamentoId?: string
  ): Promise<{
    permitido: boolean;
    motivo?: string;
    tipoBloqueio?: 'mesmo_dia' | 'intervalo_7_dias';
    diasConflito?: number;
    dataConflito?: string;
    consultaExistenteId?: string;
  }> {
    try {
      const cleanSearch = (pacienteNomeOuId || '').toLowerCase().trim();
      const cleanEmail = (pacienteEmail || '').toLowerCase().trim();

      // Exceção Homologada: Usuário de teste 'everaldozspaciente@gmail.com' pode agendar livremente
      const isTestPatient =
        cleanEmail === 'everaldozspaciente@gmail.com' ||
        cleanSearch === 'everaldozspaciente@gmail.com' ||
        cleanSearch === '1b594c6e-400f-4ca7-9a19-282de3ef8832' ||
        pacienteNomeOuId === '1b594c6e-400f-4ca7-9a19-282de3ef8832';

      if (isTestPatient) {
        return { permitido: true };
      }

      // Normaliza a data alvo para timestamp do início do dia
      let targetD: Date;
      if (typeof targetDate === 'string') {
        if (targetDate.includes('-')) {
          const [y, m, d] = targetDate.split('T')[0].split('-').map(Number);
          targetD = new Date(y, m - 1, d);
        } else {
          targetD = new Date(targetDate);
        }
      } else {
        targetD = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      }

      if (isNaN(targetD.getTime())) {
        return { permitido: true };
      }

      const targetMidnight = new Date(targetD.getFullYear(), targetD.getMonth(), targetD.getDate()).getTime();

      // Busca todos os agendamentos cadastrados
      const todos = await this.getAgendamentos();

      // Filtra agendamentos do paciente que estejam ativos (ignora desmarcados e cancelados)
      const agendamentosPaciente = todos.filter((a) => {
        if (currentAgendamentoId && a.id === currentAgendamentoId) return false;
        const matchId = a.pacienteId && a.pacienteId === pacienteNomeOuId;
        const matchName = a.patientName && a.patientName.toLowerCase().trim() === cleanSearch;
        if (!matchId && !matchName) return false;

        const st = (a.status || '').toLowerCase();
        const isCancelado = st.includes('cancel') || st.includes('desmarc') || st.includes('falta');
        return !isCancelado;
      });

      if (agendamentosPaciente.length === 0) {
        return { permitido: true };
      }

      for (const a of agendamentosPaciente) {
        let appD: Date | null = null;
        if (a.dataHoraInicio) {
          const parsed = new Date(a.dataHoraInicio);
          if (!isNaN(parsed.getTime())) {
            appD = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
          }
        }

        if (!appD && a.date) {
          if (a.date.includes('-')) {
            const [y, m, d] = a.date.split('T')[0].split('-').map(Number);
            appD = new Date(y, m - 1, d);
          } else {
            const matchDia = a.date.match(/(\d{1,2})/);
            if (matchDia) {
              const dia = parseInt(matchDia[1], 10);
              appD = new Date(2026, 10, dia);
            }
          }
        }

        if (!appD || isNaN(appD.getTime())) continue;

        const appMidnight = new Date(appD.getFullYear(), appD.getMonth(), appD.getDate()).getTime();
        const diffMs = Math.abs(targetMidnight - appMidnight);
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        const pad = (n: number) => String(n).padStart(2, '0');
        const dataFormatada = `${pad(appD.getDate())}/${pad(appD.getMonth() + 1)}/${appD.getFullYear()}`;

        // 1. Regra de mesmo dia
        if (diffDays === 0) {
          return {
            permitido: false,
            tipoBloqueio: 'mesmo_dia',
            diasConflito: 0,
            dataConflito: dataFormatada,
            consultaExistenteId: a.id,
            motivo: `Limite de 1 Consulta por Dia: Você já possui uma consulta marcada para este dia (${dataFormatada}). Não é permitido agendar dois horários na mesma data.`
          };
        }

        // 2. Regra de intervalo de 7 dias
        if (diffDays < 7) {
          const diasFaltantes = 7 - diffDays;
          return {
            permitido: false,
            tipoBloqueio: 'intervalo_7_dias',
            diasConflito: diffDays,
            dataConflito: dataFormatada,
            consultaExistenteId: a.id,
            motivo: `Intervalo Mínimo de 7 Dias: Você já possui uma consulta marcada para ${dataFormatada}. O intervalo mínimo entre consultas para pacientes é de 7 dias (faltam ${diasFaltantes} dia(s) para poder agendar outra consulta).`
          };
        }
      }

      return { permitido: true };
    } catch (err) {
      console.warn('[agendaService.verificarRegraAgendamentoPaciente] Erro:', err);
      return { permitido: true };
    }
  },

  async saveAgendamento(
    agendamento: Partial<AgendaAppointmentItem> & {
      pacienteId?: string;
      pacienteNome?: string;
      pacienteEmail?: string;
      pacienteTelefone?: string;
      dentistaId?: string;
      procedimentoId?: string;
      procedimentoNome?: string;
      dataHoraInicio?: string;
      dataHoraFim?: string;
      observacoes?: string;
    }
  ): Promise<any> {
    try {
      // 1. Data e Horário
      let startDateTime: Date;
      let endDateTime: Date;

      if (agendamento.dataHoraInicio) {
        startDateTime = new Date(agendamento.dataHoraInicio);
        endDateTime = agendamento.dataHoraFim
          ? new Date(agendamento.dataHoraFim)
          : new Date(startDateTime.getTime() + 45 * 60000);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const dateStr = agendamento.date || today;
        const time = agendamento.time || '09:00';
        const [h, m] = time.split(':').map(Number);
        startDateTime = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        endDateTime = new Date(startDateTime.getTime() + 45 * 60000);
      }

      // 1.1 Validação Estrita de Conflito de Horário e Prevenção de Duplo Agendamento
      const dateOnlyKey = agendamento.date || startDateTime.toISOString().split('T')[0];
      const pEmailParam = (agendamento.pacienteEmail || (agendamento as any).email || '').trim().toLowerCase();
      const conflito = await this.verificarConflitoDuploAgendamento(
        agendamento.pacienteId || agendamento.patientName || agendamento.pacienteNome || '',
        dateOnlyKey,
        agendamento.id,
        startDateTime,
        endDateTime,
        pEmailParam
      );

      if (!conflito.permitido) {
        throw new Error(conflito.motivo || 'Conflito de agendamento detectado. Não é permitido duplo agendamento no mesmo horário.');
      }

      // 2. Resolução dinâmica e segura do paciente_id (Garante UUID válido para o PostgreSQL)
      let resolvedPacienteId: string | null = isValidUUID(agendamento.pacienteId)
        ? agendamento.pacienteId!.trim()
        : null;

      const pName = (agendamento.patientName || agendamento.pacienteNome || '').trim();
      const pEmail = (agendamento.pacienteEmail || (agendamento as any).email || '').trim();
      const pPhone = agendamento.phone || agendamento.pacienteTelefone || '(24) 99999-9999';

      if (!resolvedPacienteId && (pEmail || pName)) {
        if (pEmail) {
          const { data: foundByEmail } = await supabase
            .from('pacientes')
            .select('id')
            .eq('email', pEmail)
            .limit(1)
            .maybeSingle();

          if (foundByEmail?.id && isValidUUID(foundByEmail.id)) {
            resolvedPacienteId = foundByEmail.id;
          }
        }

        if (!resolvedPacienteId && pName) {
          const { data: foundByName } = await supabase
            .from('pacientes')
            .select('id')
            .ilike('nome', pName)
            .limit(1)
            .maybeSingle();

          if (foundByName?.id && isValidUUID(foundByName.id)) {
            resolvedPacienteId = foundByName.id;
          }
        }

        // Se ainda não existe cadastro para este paciente, cria agora
        if (!resolvedPacienteId && pName) {
          const newPacId = crypto.randomUUID();
          const { data: newPac, error: insertErr } = await supabase
            .from('pacientes')
            .insert({
              id: newPacId,
              nome: pName,
              email: pEmail || null,
              telefone: pPhone,
              convenio: agendamento.insurance || 'Particular',
              status: 'ativo',
            })
            .select('id')
            .maybeSingle();

          if (newPac?.id && isValidUUID(newPac.id)) {
            resolvedPacienteId = newPac.id;
          } else if (!insertErr) {
            resolvedPacienteId = newPacId;
          }
        }
      }

      // Fallback seguro: se ainda não houver paciente_id válido, obtém o primeiro existente ou gera ficha
      if (!resolvedPacienteId || !isValidUUID(resolvedPacienteId)) {
        const { data: firstPac } = await supabase.from('pacientes').select('id').limit(1).maybeSingle();
        if (firstPac?.id && isValidUUID(firstPac.id)) {
          resolvedPacienteId = firstPac.id;
        } else {
          const fallbackId = crypto.randomUUID();
          await supabase.from('pacientes').insert({
            id: fallbackId,
            nome: pName || 'Paciente Institucional',
            telefone: pPhone,
            convenio: 'Particular',
            status: 'ativo',
          });
          resolvedPacienteId = fallbackId;
        }
      }

      // 3. Resolução dinâmica e segura do procedimento_id
      let resolvedProcedimentoId: string | null = isValidUUID(agendamento.procedimentoId)
        ? agendamento.procedimentoId!.trim()
        : null;

      const procRaw = agendamento.procedure || agendamento.procedimentoNome || '';
      const cleanProcName = procRaw.split(' (')[0].trim();

      if (!resolvedProcedimentoId && cleanProcName) {
        const { data: foundProc } = await supabase
          .from('procedimentos')
          .select('id')
          .ilike('nome', cleanProcName)
          .limit(1)
          .maybeSingle();

        if (foundProc?.id && isValidUUID(foundProc.id)) {
          resolvedProcedimentoId = foundProc.id;
        }
      }

      // Se ainda não encontrou, busca qualquer procedimento cadastrado na clínica
      if (!resolvedProcedimentoId) {
        const { data: anyProc } = await supabase
          .from('procedimentos')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (anyProc?.id && isValidUUID(anyProc.id)) {
          resolvedProcedimentoId = anyProc.id;
        } else {
          resolvedProcedimentoId = null; // Coluna aceita NULL com segurança
        }
      }

      // 4. Dentista e Cadeira (Verificação estrita de integridade referencial)
      let resolvedDentistaId: string | null = isValidUUID(agendamento.dentistaId)
        ? agendamento.dentistaId!.trim()
        : null;

      if (!resolvedDentistaId) {
        const { data: dUser } = await supabase
          .from('usuarios')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (dUser?.id && isValidUUID(dUser.id)) {
          resolvedDentistaId = dUser.id;
        } else {
          resolvedDentistaId = null;
        }
      }

      let resolvedCadeiraId: string | null = isValidUUID((agendamento as any).cadeiraId)
        ? (agendamento as any).cadeiraId!.trim()
        : null;

      if (!resolvedCadeiraId) {
        const { data: cChair } = await supabase
          .from('cadeiras_clinicas')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (cChair?.id && isValidUUID(cChair.id)) {
          resolvedCadeiraId = cChair.id;
        } else {
          // Quando a tabela de cadeiras estiver vazia, deve ser NULL (evita violação de FK)
          resolvedCadeiraId = null;
        }
      }

      // 5. Montagem do payload seguro (NUNCA envia string vazia "" para campos UUID)
      const payload: Record<string, any> = {
        paciente_id: resolvedPacienteId,
        dentista_id: resolvedDentistaId,
        cadeira_id: resolvedCadeiraId,
        procedimento_id: resolvedProcedimentoId,
        data_hora_inicio: startDateTime.toISOString(),
        data_hora_fim: endDateTime.toISOString(),
        status: agendamento.status || (agendamento.isEncaixe ? 'Encaixe de Urgência' : 'Confirmado'),
        tipo: agendamento.isEncaixe ? 'Encaixe' : agendamento.isSurgery ? 'Cirurgia' : 'Procedimento',
        observacoes: agendamento.notes || agendamento.observacoes || null,
      };

      const isRealId =
        Boolean(agendamento.id) &&
        isValidUUID(agendamento.id) &&
        !agendamento.id!.startsWith('app-') &&
        !agendamento.id!.startsWith('slot-');

      if (isRealId) {
        payload.id = agendamento.id;
      }

      // 6. Tenta salvar via RPC salvar_agendamento
      let savedResult: any = null;
      const { data, error } = await supabase.rpc('salvar_agendamento', { p_dados: payload });
      if (error) {
        // Fallback direto na tabela agendamentos
        if (isRealId) {
          const { data: updated, error: updateError } = await supabase
            .from('agendamentos')
            .update(payload)
            .eq('id', agendamento.id!)
            .select()
            .single();
          if (updateError) throw updateError;
          savedResult = updated;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('agendamentos')
            .insert(payload)
            .select()
            .single();
          if (insertError) throw insertError;
          savedResult = inserted;
        }
      } else {
        savedResult = data;
      }

      // 7. Disparo automático garantido da confirmação no WhatsApp para todos os canais (Site, Agenda, Portal)
      try {
        const timeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(
          startDateTime.getMinutes()
        ).padStart(2, '0')}`;
        const dateStr = `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(startDateTime.getDate()).padStart(2, '0')}`;

        whatsappNotificationService.scheduleAppointmentConfirmation({
          patientName: pName || 'Paciente Odonto Souza',
          phone: pPhone && pPhone !== '(24) 99999-9999' ? pPhone : undefined,
          date: dateStr,
          time: timeStr,
          procedure: cleanProcName || 'Consulta Odontológica',
          pacienteId: resolvedPacienteId || undefined,
          delayMs: 1500,
        });
      } catch (waErr: any) {
        console.warn('[agendaService.saveAgendamento] Erro no agendamento do WhatsApp:', waErr.message);
      }

      // 8. Emissão garantida de notificação clínica e sonora em tempo real para todo o sistema (Site, Portal, Recepção)
      try {
        const timeFormatted = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(
          startDateTime.getMinutes()
        ).padStart(2, '0')}`;
        const dateFormatted = startDateTime.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const capDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

        emitirNotificacaoClinica({
          id: `notif-ag-${savedResult.id}`,
          tipo: 'novo_agendamento',
          titulo: 'Novo Agendamento Confirmado',
          mensagem: `${pName || 'Paciente'} agendou ${cleanProcName || 'Consulta'} para ${capDate} às ${timeFormatted}.`,
          detalhes: {
            pacienteNome: pName || 'Paciente',
            pacienteTelefone: pPhone || '',
            dataConsulta: `${capDate} às ${timeFormatted}`,
            horarioConsulta: timeFormatted,
            procedimento: cleanProcName || 'Consulta Odontológica',
            dentista: 'Dr. Frankisney Souza',
            origem: agendamento.observacoes?.includes('Site Institucional')
              ? 'site_institucional'
              : agendamento.observacoes?.includes('Portal do Paciente')
              ? 'portal_paciente'
              : 'recepcao',
            observacoes: agendamento.notes || agendamento.observacoes || 'Agendamento registrado no sistema.',
          },
          linkRota: 'agenda',
        });
      } catch (notifErr: any) {
        console.warn('[agendaService.saveAgendamento] Erro ao emitir notificação clínica:', notifErr?.message);
      }

      return savedResult;
    } catch (err) {
      console.error('[agendaService.saveAgendamento] Erro:', err);
      throw err;
    }
  },

  async updateStatus(id: string, status: string): Promise<any> {
    try {
      let appointmentToCancel: any = null;
      const cleanSt = (status || '').toLowerCase();
      const isDesmarcando = cleanSt.includes('desmarc') || cleanSt.includes('cancel') || cleanSt.includes('falta');

      if (isDesmarcando && id && !id.startsWith('app-') && !id.startsWith('slot-')) {
        const { data: appData } = await supabase
          .from('agendamentos')
          .select('id, data_hora_inicio, data_hora_fim, status')
          .eq('id', id)
          .maybeSingle();
        appointmentToCancel = appData;
      }

      const { data, error } = await supabase.rpc('atualizar_status_agendamento', {
        p_id: id,
        p_status: status,
      });

      let result = data;
      if (error) {
        const { data: updated, error: updateError } = await supabase
          .from('agendamentos')
          .update({ status })
          .eq('id', id);
        if (updateError) throw updateError;
        result = updated;
      }

      // Se um agendamento foi cancelado/desmarcado, aciona a auto-puxada do primeiro da fila de encaixe
      if (isDesmarcando && appointmentToCancel?.data_hora_inicio) {
        const startD = new Date(appointmentToCancel.data_hora_inicio);
        const y = startD.getFullYear();
        const m = String(startD.getMonth() + 1).padStart(2, '0');
        const d = String(startD.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${d}`;
        const timeStr = startD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        this.promoverPrimeiroEncaixeParaVaga({
          dataHoraInicio: appointmentToCancel.data_hora_inicio,
          dataHoraFim: appointmentToCancel.data_hora_fim,
          dateKey,
          time: timeStr,
        }).catch((encErr) => console.warn('[agendaService.updateStatus] Erro ao alocar encaixe:', encErr));
      }

      return result;
    } catch (err) {
      console.error('[agendaService.updateStatus] Erro:', err);
      throw err;
    }
  },

  async deleteAgendamento(id: string): Promise<boolean> {
    try {
      if (!id || id.startsWith('app-') || id.startsWith('item-')) return true;

      // Busca dados antes de deletar para poder alocar o encaixe caso a vaga seja liberada
      let appData: any = null;
      const { data } = await supabase
        .from('agendamentos')
        .select('id, data_hora_inicio, data_hora_fim, status')
        .eq('id', id)
        .maybeSingle();
      appData = data;

      const { error } = await supabase.from('agendamentos').delete().eq('id', id);
      if (error) {
        console.warn('[agendaService.deleteAgendamento] Erro no Supabase:', error.message);
        return false;
      }

      // Se deletou com sucesso e a consulta não estava concluída, aloca o 1º da fila de encaixe
      if (appData?.data_hora_inicio && !appData.status?.toLowerCase().includes('conclu')) {
        const startD = new Date(appData.data_hora_inicio);
        const y = startD.getFullYear();
        const m = String(startD.getMonth() + 1).padStart(2, '0');
        const d = String(startD.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${d}`;
        const timeStr = startD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        this.promoverPrimeiroEncaixeParaVaga({
          dataHoraInicio: appData.data_hora_inicio,
          dataHoraFim: appData.data_hora_fim,
          dateKey,
          time: timeStr,
        }).catch((encErr) => console.warn('[agendaService.deleteAgendamento] Erro ao alocar encaixe:', encErr));
      }

      return true;
    } catch (err) {
      console.error('[agendaService.deleteAgendamento] Exceção:', err);
      return false;
    }
  },

  /**
   * Promove automaticamente o primeiro paciente da Fila de Encaixe para a vaga liberada por desistência.
   * O paciente alocado recebe instantaneamente uma notificação completa no WhatsApp com os dados da consulta.
   */
  async promoverPrimeiroEncaixeParaVaga(vaga: {
    dataHoraInicio: string;
    dataHoraFim?: string;
    dateKey: string;
    time?: string;
  }): Promise<{ id: string; patientName: string; phone?: string; time: string } | null> {
    try {
      // 1. Busca os encaixes cadastrados no Supabase ordenados por ordem cronológica de criação (1º da fila)
      const { data: encaixes, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          paciente_id,
          dentista_id,
          cadeira_id,
          procedimento_id,
          data_hora_inicio,
          data_hora_fim,
          status,
          tipo,
          observacoes,
          criado_em,
          pacientes (id, nome, telefone),
          procedimentos (id, nome)
        `)
        .or('tipo.eq.Encaixe,status.eq.Encaixe de Urgência,status.eq.Em Espera')
        .order('criado_em', { ascending: true });

      if (error || !encaixes || encaixes.length === 0) {
        return null;
      }

      // Filtra os que pertencem à data da vaga liberada e que ainda não estejam concluídos/cancelados
      const encaixeCandidato = encaixes.find((enc: any) => {
        const encDate = new Date(enc.data_hora_inicio);
        const y = encDate.getFullYear();
        const m = String(encDate.getMonth() + 1).padStart(2, '0');
        const d = String(encDate.getDate()).padStart(2, '0');
        const encDateKey = `${y}-${m}-${d}`;
        const st = (enc.status || '').toLowerCase();
        const isStillPending = !st.includes('conclu') && !st.includes('cancel') && !st.includes('desmarc') && !st.includes('atendimento');
        return encDateKey === vaga.dateKey && isStillPending;
      });

      if (!encaixeCandidato) {
        return null;
      }

      // 2. Calcula novo horário de início e fim baseado na vaga liberada
      const targetStart = new Date(vaga.dataHoraInicio);
      const targetEnd = vaga.dataHoraFim
        ? new Date(vaga.dataHoraFim)
        : new Date(targetStart.getTime() + 45 * 60000);

      const targetTimeStr = vaga.time || targetStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // 3. Atualiza o agendamento no Supabase
      const { error: updateErr } = await supabase
        .from('agendamentos')
        .update({
          data_hora_inicio: targetStart.toISOString(),
          data_hora_fim: targetEnd.toISOString(),
          status: 'Confirmado',
          tipo: 'Procedimento',
          observacoes: (encaixeCandidato.observacoes ? encaixeCandidato.observacoes + ' | ' : '') + `Alocado automaticamente da Fila de Encaixe para ${targetTimeStr}`,
        })
        .eq('id', encaixeCandidato.id);

      if (updateErr) {
        console.error('[agendaService.promoverPrimeiroEncaixeParaVaga] Erro ao atualizar encaixe:', updateErr.message);
        return null;
      }

      const pName = encaixeCandidato.pacientes?.nome || 'Paciente';
      const pPhone = encaixeCandidato.pacientes?.telefone;
      const procName = encaixeCandidato.procedimentos?.nome || 'Consulta Odontológica';

      // 4. Envia mensagem no WhatsApp com os dados completos do agendamento
      await whatsappNotificationService.notifyEncaixePromovido({
        patientName: pName,
        phone: pPhone,
        date: vaga.dateKey,
        time: targetTimeStr,
        dentist: 'Dr. Frankisney Souza',
        procedure: procName,
        pacienteId: encaixeCandidato.paciente_id,
      });

      // 5. Emite notificação sonora e no sininho do sistema
      emitirNotificacaoClinica({
        id: `notif-promovido-${encaixeCandidato.id}`,
        tipo: 'novo_agendamento',
        titulo: 'Vaga Preenchida por Fila de Encaixe! 🎉',
        mensagem: `${pName} foi transferido(a) automaticamente da Fila de Encaixe para as ${targetTimeStr}. Mensagem com dados enviada no WhatsApp!`,
        detalhes: {
          pacienteNome: pName,
          pacienteTelefone: pPhone || '',
          dataConsulta: `${vaga.dateKey} às ${targetTimeStr}`,
          horarioConsulta: targetTimeStr,
          procedimento: procName,
          dentista: 'Dr. Frankisney Souza',
          origem: 'fila_encaixe_automatica',
        },
        linkRota: 'agenda',
      });

      return {
        id: encaixeCandidato.id,
        patientName: pName,
        phone: pPhone,
        time: targetTimeStr,
      };
    } catch (e) {
      console.error('[agendaService.promoverPrimeiroEncaixeParaVaga] Falha ao processar encaixe:', e);
      return null;
    }
  },
};
