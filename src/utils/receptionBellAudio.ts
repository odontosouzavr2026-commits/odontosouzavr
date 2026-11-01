/**
 * Sintetizador de Som: Campainha de Recepção de Balcão (Service Bell)
 * 
 * Emite o som clássico e brilhante de campainha metálica ("Ding-Ding!"),
 * repetindo exatamente 2 vezes com intervalo rítmico natural.
 * Utiliza a Web Audio API nativa para precisão e sem necessidade de arquivos externos.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Toca um único "Ding!" de campainha metálica de latão
 */
function playSingleDing(ctx: AudioContext, startTime: number, volume: number = 0.85): void {
  // 1. Oscilador Fundamental (Tom principal puro e brilhante - Mi/C7 ~2093Hz)
  const oscMain = ctx.createOscillator();
  const gainMain = ctx.createGain();

  oscMain.type = 'sine';
  oscMain.frequency.setValueAtTime(2093, startTime); // A6/C7 tom de campainha

  gainMain.gain.setValueAtTime(volume * 0.7, startTime);
  // Ataque rápido e decaimento exponencial metálico suave
  gainMain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.25);

  oscMain.connect(gainMain);
  gainMain.connect(ctx.destination);

  oscMain.start(startTime);
  oscMain.stop(startTime + 1.25);

  // 2. Oscilador Harmônico Superior (Brilho metálico da carcaça do sino ~4186Hz)
  const oscHarmonic = ctx.createOscillator();
  const gainHarmonic = ctx.createGain();

  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(4186, startTime);

  gainHarmonic.gain.setValueAtTime(volume * 0.35, startTime);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.85);

  oscHarmonic.connect(gainHarmonic);
  gainHarmonic.connect(ctx.destination);

  oscHarmonic.start(startTime);
  oscHarmonic.stop(startTime + 0.85);

  // 3. Toque de Percussão / Badalo de Metal (Click inicial transitório ~2793Hz)
  const oscStrike = ctx.createOscillator();
  const gainStrike = ctx.createGain();

  oscStrike.type = 'triangle';
  oscStrike.frequency.setValueAtTime(2793, startTime);

  gainStrike.gain.setValueAtTime(volume * 0.45, startTime);
  gainStrike.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.15);

  oscStrike.connect(gainStrike);
  gainStrike.connect(ctx.destination);

  oscStrike.start(startTime);
  oscStrike.stop(startTime + 0.15);
}

/**
 * Toca a campainha de recepção EXATAMENTE 2 VEZES ("Ding!... Ding!")
 */
export function playReceptionBell2x(volume: number = 0.85): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // 1º Ding imediato
    playSingleDing(ctx, now, volume);

    // 2º Ding com intervalo natural de campainha de recepção (380ms)
    playSingleDing(ctx, now + 0.38, volume);
  } catch (err) {
    console.warn('[receptionBellAudio] Não foi possível reproduzir som de notificação:', err);
  }
}
