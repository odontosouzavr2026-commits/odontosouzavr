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
    novoHorarioFim?: Date
  ): Promise<{ permitido: boolean; motivo?: string }> {
    try {
      if (!pacienteNomeOuId || !dateStr) return { permitido: true };
      const agendamentos = await this.getAgendamentosPorData(dateStr);
      const cleanSearch = (pacienteNomeOuId || '').toLowerCase().trim();

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
      const conflito = await this.verificarConflitoDuploAgendamento(
        agendamento.pacienteId || agendamento.patientName || agendamento.pacienteNome || '',
        dateOnlyKey,
        agendamento.id,
        startDateTime,
        endDateTime
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
      const { data, error } = await supabase.rpc('atualizar_status_agendamento', {
        p_id: id,
        p_status: status,
      });
      if (error) {
        const { data: updated, error: updateError } = await supabase
          .from('agendamentos')
          .update({ status })
          .eq('id', id);
        if (updateError) throw updateError;
        return updated;
      }
      return data;
    } catch (err) {
      console.error('[agendaService.updateStatus] Erro:', err);
      throw err;
    }
  },

  async deleteAgendamento(id: string): Promise<boolean> {
    try {
      if (!id || id.startsWith('app-') || id.startsWith('item-')) return true;
      const { error } = await supabase.from('agendamentos').delete().eq('id', id);
      if (error) {
        console.warn('[agendaService.deleteAgendamento] Erro no Supabase:', error.message);
      }
      return !error;
    } catch (err) {
      console.error('[agendaService.deleteAgendamento] Exceção:', err);
      return false;
    }
  },
};
