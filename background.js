/**
 * Background Service Worker - PhishGuard
 * Intercepta navegações e executa a triagem local das URLs acessadas.
 */

// Importa o módulo de pré-processamento de URLs
try {
  importScripts(chrome.runtime.getURL('scripts_js/url_preprocessor.js'));
} catch (erro) {
  console.error('[PhishGuard] Erro ao carregar url_preprocessor.js no service worker:', erro);
}

if (typeof PhishGuardPreprocessor === 'undefined') {
  console.error('[PhishGuard] Módulo PhishGuardPreprocessor não definido no service worker.');
}

// Configura a extensão para abrir o painel lateral ao clicar no ícone
if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === 'function') {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((erro) => {
    console.error('[PhishGuard] Erro ao configurar painel lateral:', erro);
  });
}

// Intercepta e analisa URLs durante a navegação em tempo real
chrome.webNavigation.onBeforeNavigate.addListener(async (detalhes) => {
  if (detalhes.frameId === 0 && detalhes.url && detalhes.url.startsWith('http')) {
    try {
      if (typeof PhishGuardPreprocessor !== 'undefined') {
        const analise = PhishGuardPreprocessor.analisarUrl(detalhes.url);
        // Exibe o log detalhado no console conforme especificado em parte1_modulo_deteccao_base.md
        PhishGuardPreprocessor.imprimirConsoleAnalise(analise, detalhes.url);

        if (analise.deveEscalonar) {
          console.log(`[PhishGuard] Escalonando para backend Flask: ${analise.regrasAtivadas.join(', ')}`);
        }
      }
    } catch (erro) {
      console.error('[PhishGuard] Erro ao realizar triagem da URL no background:', erro);
    }
  }
});
