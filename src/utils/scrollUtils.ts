/**
 * Garante que a janela e todos os contêineres de rolagem voltem ao topo absoluto (início).
 * Utilizado sempre que uma tela, rota, formulário ou aba for aberta no OdontoSouza.
 */
export const scrollToTop = () => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Rolagem imediata da janela principal
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 2. Rolagem dos elementos raiz HTML e BODY
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Rolagem do elemento principal <main> e de contêineres roláveis
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
    scrollContainers.forEach((el) => {
      el.scrollTop = 0;
    });
  } catch {
    // Fallback seguro
  }
};
