import { supabase } from '../lib/supabase';
import { AgendaAppointmentItem, AppointmentScheduleStatus } from '../types/agenda';

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
   * Valida a regra de negócio: Um paciente não pode marcar dois horários no mesmo dia,
   * a não ser que um horário marcado já esteja com o status de 'Concluído'.
   */
  async verificarConflitoDuploAgendamento(
    pacienteNomeOuId: string,
    dateStr: string,
    currentAgendamentoId?: string
  ): Promise<{ permitido: boolean; motivo?: string }> {
    try {
      if (!pacienteNomeOuId || !dateStr) return { permitido: true };
      const agendamentos = await this.getAgendamentosPorData(dateStr);
      const cleanSearch = pacienteNomeOuId.toLowerCase().trim();

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
            'Regra Clínica: O paciente já possui um agendamento ativo nesta data. Não é permitido marcar dois horários no mesmo dia, exceto se a consulta anterior já estiver concluída.',
        };
      }

      return { permitido: true };
    } catch (err) {
      console.warn('[agendaService.verificarConflitoDuploAgendamento] Erro na checagem:', err);
      return { permitido: true };
    }
  },

  async saveAgendamento(
    agendamento: Partial<AgendaAppointmentItem> & { pacienteId?: string; dentistaId?: string; procedimentoId?: string }
  ): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dateStr = agendamento.date || today;
      const time = agendamento.time || '09:00';

      const [h, m] = time.split(':').map(Number);
      const startDateTime = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 45 * 60000);

      // 1. Resolução dinâmica do pacienteId (nunca vincular a outro paciente)
      let resolvedPacienteId = agendamento.pacienteId;
      if (!resolvedPacienteId && agendamento.patientName) {
        const { data: foundPac } = await supabase
          .from('pacientes')
          .select('id')
          .ilike('nome', agendamento.patientName.trim())
          .limit(1)
          .maybeSingle();

        if (foundPac?.id) {
          resolvedPacienteId = foundPac.id;
        } else {
          // Cria o paciente automaticamente caso ainda não exista
          const { data: newPac } = await supabase
            .from('pacientes')
            .insert({
              nome: agendamento.patientName.trim(),
              telefone: agendamento.phone || '(24) 99999-9999',
              cpf: agendamento.cpf || undefined,
              convenio: agendamento.insurance || 'Particular',
            })
            .select('id')
            .single();

          if (newPac?.id) {
            resolvedPacienteId = newPac.id;
          }
        }
      }

      // 2. Resolução dinâmica do procedimentoId
      let resolvedProcedimentoId = agendamento.procedimentoId;
      if (!resolvedProcedimentoId && agendamento.procedure) {
        const cleanName = agendamento.procedure.split(' (')[0].trim();
        const { data: foundProc } = await supabase
          .from('procedimentos')
          .select('id')
          .ilike('nome', cleanName)
          .limit(1)
          .maybeSingle();

        if (foundProc?.id) {
          resolvedProcedimentoId = foundProc.id;
        }
      }

      const isRealId =
        Boolean(agendamento.id) &&
        !agendamento.id!.startsWith('app-') &&
        !agendamento.id!.startsWith('slot-');

      const payload: any = {
        paciente_id: resolvedPacienteId,
        dentista_id: agendamento.dentistaId || '20000000-0000-0000-0000-000000000001',
        cadeira_id: '10000000-0000-0000-0000-000000000001',
        procedimento_id: resolvedProcedimentoId || '30000000-0000-0000-0000-000000000001',
        data_hora_inicio: startDateTime.toISOString(),
        data_hora_fim: endDateTime.toISOString(),
        status: agendamento.status || (agendamento.isEncaixe ? 'Encaixe de Urgência' : 'Confirmado'),
        tipo: agendamento.isEncaixe ? 'Encaixe' : agendamento.isSurgery ? 'Cirurgia' : 'Procedimento',
        observacoes: agendamento.notes,
      };

      if (isRealId) {
        payload.id = agendamento.id;
      }

      // Se temos ID real e vamos salvar, podemos fazer update diretamente ou via salvar_agendamento
      const { data, error } = await supabase.rpc('salvar_agendamento', { p_dados: payload });
      if (error) {
        if (isRealId) {
          const { data: updated, error: updateError } = await supabase
            .from('agendamentos')
            .update(payload)
            .eq('id', agendamento.id)
            .select()
            .single();
          if (updateError) throw updateError;
          return updated;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('agendamentos')
            .insert(payload)
            .select()
            .single();
          if (insertError) throw insertError;
          return inserted;
        }
      }
      return data;
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
