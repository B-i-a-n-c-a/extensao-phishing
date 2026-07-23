document.addEventListener('DOMContentLoaded', async () => {
    const analysisCard = document.getElementById('analysis-card');
    const currentDomainEl = document.getElementById('current-domain');
    const statusBadgeEl = document.getElementById('status-badge');
    const verifyBtn = document.getElementById('verify-btn');
    const resetBtn = document.getElementById('reset-btn');
    const manualUrlInput = document.getElementById('manual-url');
    const apiIndicator = document.getElementById('api-indicator');
    const apiText = document.getElementById('api-text');
    const validationMsg = document.getElementById('validation-message');
    const iconLoading = document.getElementById('icon-loading');

    const btnExplicarAmeaca = document.getElementById('btn-explicar-ameaca');
    const iconAlertBadge = document.getElementById('icon-alert-badge');
    const modalExplicacao = document.getElementById('modal-explicacao');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const btnFecharModalTopo = document.getElementById('btn-fechar-modal-topo');
    const modalTabs = document.getElementById('modal-tabs');
    const modalThreatIcon = document.getElementById('modal-threat-icon');
    const modalThreatTitle = document.getElementById('modal-threat-title');
    const modalThreatRiskBadge = document.getElementById('modal-threat-risk-badge');
    const modalThreatSummary = document.getElementById('modal-threat-summary');
    const modalThreatMeaning = document.getElementById('modal-threat-meaning');
    const modalThreatDangers = document.getElementById('modal-threat-dangers');
    const modalThreatTips = document.getElementById('modal-threat-tips');
    const modalThreatExample = document.getElementById('modal-threat-example');

    let ameacasAtivas = [];
    let analiseAtual = null;

    // Injeção dos ícones SVG da central ICONS
    if (typeof ICONS !== 'undefined') {
        document.getElementById('icon-shield').innerHTML = ICONS.shield || '';
        document.getElementById('icon-search').innerHTML = ICONS.search || '';
        iconLoading.innerHTML = ICONS.loading || '';
        if (iconAlertBadge) iconAlertBadge.innerHTML = ICONS.BOTAO_INTERROGACAO || ICONS.ALERTA;
        if (btnFecharModalTopo) btnFecharModalTopo.innerHTML = ICONS.FECHAR || '&times;';

        const iconBackEl = document.getElementById('icon-back');
        if (iconBackEl) iconBackEl.innerHTML = ICONS.back || '';

        // Seções do Modal
        const secMeaning = document.getElementById('icon-section-meaning');
        const secDanger = document.getElementById('icon-section-danger');
        const secTips = document.getElementById('icon-section-tips');
        const secExample = document.getElementById('icon-section-example');

        if (secMeaning) secMeaning.innerHTML = ICONS.SAIBAMAIS || '';
        if (secDanger) secDanger.innerHTML = ICONS.PERIGO || '';
        if (secTips) secTips.innerHTML = ICONS.CHECK || '';
        if (secExample) secExample.innerHTML = ICONS.INFO || ICONS.info || '';
    }

    const ENDPOINT_BACKEND = 'http://127.0.0.1:5000/api/verify';

    function exibirValidacao(tipo, icone, texto, textoSecundario = '') {
        validationMsg.className = `validation-msg ${tipo}`;
        validationMsg.innerHTML = `
            <div>${icone}</div>
            <div>
                <div>${texto}</div>
                ${textoSecundario ? `<div style="font-size: 0.9rem; opacity: 0.8; margin-top: 4px;">${textoSecundario}</div>` : ''}
            </div>
        `;
    }

    function ocultarValidacao() {
        validationMsg.className = 'validation-msg hidden';
    }

    function fecharModal() {
        if (modalExplicacao) {
            modalExplicacao.classList.add('hidden');
        }
    }

    function renderizarExplicacaoModal(indice) {
        if (!ameacasAtivas || ameacasAtivas.length === 0) return;
        const chaveAmeaca = ameacasAtivas[indice];
        const carac = analiseAtual ? analiseAtual.caracteristicas : {};
        const dadosExplicacao = typeof obterExplicacaoAmeaca === 'function' ? obterExplicacaoAmeaca(chaveAmeaca, carac) : (EXPLICACOES_AMEACAS[chaveAmeaca] || null);

        if (!dadosExplicacao) return;

        // Renderiza o SVG específico do tipo de ameaça
        const svgIcone = (typeof ICONS !== 'undefined' && ICONS[dadosExplicacao.iconeChave]) ? ICONS[dadosExplicacao.iconeChave] : (ICONS.ALERTA || '⚠️');
        modalThreatIcon.innerHTML = svgIcone;

        modalThreatTitle.textContent = dadosExplicacao.titulo;
        modalThreatRiskBadge.textContent = `RISCO ${dadosExplicacao.nivelRisco}`;
        modalThreatRiskBadge.className = `risk-pill ${dadosExplicacao.corRisco}`;

        modalThreatSummary.textContent = dadosExplicacao.resumo;
        modalThreatMeaning.textContent = dadosExplicacao.oQueSignifica;

        // Lista de perigos com ícones
        modalThreatDangers.innerHTML = dadosExplicacao.porQueEPerigoso.map(item => `<li>${item}</li>`).join('');

        // Lista de dicas de segurança
        modalThreatTips.innerHTML = dadosExplicacao.dicasSeguranca.map(item => `<li>${item}</li>`).join('');

        // Exemplo Prático dinâmico (Cirílico, Grego, Armênio, Porta Não Padrão)
        modalThreatExample.textContent = dadosExplicacao.exemplo;

        // Atualiza abas ativas
        const tabBtns = modalTabs.querySelectorAll('.threat-tab-btn');
        tabBtns.forEach((btn, i) => {
            if (i === indice) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Abre o modal explicativo com suporte a múltiplas abas e ícones SVG
     */
    function abrirModalExplicacao(ameacas) {
        if (!ameacas || ameacas.length === 0) return;
        ameacasAtivas = ameacas;

        if (ameacasAtivas.length > 1) {
            modalTabs.classList.remove('hidden');
            modalTabs.innerHTML = ameacasAtivas.map((chave, i) => {
                const carac = analiseAtual ? analiseAtual.caracteristicas : {};
                const item = typeof obterExplicacaoAmeaca === 'function' ? obterExplicacaoAmeaca(chave, carac) : EXPLICACOES_AMEACAS[chave];
                const svgTab = (typeof ICONS !== 'undefined' && item && ICONS[item.iconeChave]) ? ICONS[item.iconeChave] : '';
                const titulo = item ? item.titulo : `Ameaça ${i + 1}`;
                return `<button class="threat-tab-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${svgTab} <span>${titulo}</span></button>`;
            }).join('');

            const tabBtns = modalTabs.querySelectorAll('.threat-tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                    renderizarExplicacaoModal(index);
                });
            });
        } else {
            modalTabs.classList.add('hidden');
        }

        renderizarExplicacaoModal(0);
        modalExplicacao.classList.remove('hidden');
    }

    // Handlers para o Modal
    if (btnExplicarAmeaca) {
        btnExplicarAmeaca.addEventListener('click', () => {
            if (analiseAtual && analiseAtual.ameacasDetectadas && analiseAtual.ameacasDetectadas.length > 0) {
                abrirModalExplicacao(analiseAtual.ameacasDetectadas);
            }
        });
    }

    if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
    if (btnFecharModalTopo) btnFecharModalTopo.addEventListener('click', fecharModal);

    if (modalExplicacao) {
        modalExplicacao.addEventListener('click', (e) => {
            if (e.target === modalExplicacao) {
                fecharModal();
            }
        });
    }

    // Botão no topo superior esquerdo para voltar à tela inicial / resetar análise
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            analysisCard.classList.add('hidden');
            resetBtn.classList.add('hidden');
            if (btnExplicarAmeaca) btnExplicarAmeaca.classList.add('hidden');
            manualUrlInput.value = '';
            fecharModal();
            ocultarValidacao();
            apiIndicator.className = 'status-dot offline';
            apiText.textContent = 'Backend Offline';
        });
    }

    verifyBtn.addEventListener('click', async () => {
        ocultarValidacao();
        fecharModal();
        analysisCard.classList.add('hidden');
        if (resetBtn) resetBtn.classList.add('hidden');
        if (btnExplicarAmeaca) btnExplicarAmeaca.classList.add('hidden');

        const urlValor = manualUrlInput.value.trim();

        // 1. Validação de campo vazio
        if (!urlValor) {
            exibirValidacao('error', ICONS ? ICONS.error : '⚠️', 'Campo vazio. Informe uma URL para iniciar a análise.');
            return;
        }

        let urlCompleta = urlValor;
        let possuiProtocolo = true;

        if (!urlValor.startsWith('http://') && !urlValor.startsWith('https://')) {
            possuiProtocolo = false;
            urlCompleta = 'http://' + urlValor;
        }

        let objetoUrl;
        try {
            objetoUrl = new URL(urlCompleta);
            if (!objetoUrl.hostname || (!objetoUrl.hostname.includes('.') && objetoUrl.hostname !== 'localhost')) {
                throw new Error('URL sem formato de domínio válido');
            }
        } catch (e) {
            exibirValidacao('error', ICONS ? ICONS.error : '⚠️', 'URL inválida. Por favor, informe um endereço válido.', 'Exemplo: https://www.exemplo.com');
            return;
        }

        // Aviso quando o protocolo é omitido
        if (!possuiProtocolo) {
            exibirValidacao('info', ICONS ? ICONS.info : 'ℹ️', 'Dica: Inclua o protocolo (http:// ou https://) para melhor análise.');
        }

        // Triagem local através do pré-processador
        let preprocessado;
        if (typeof PhishGuardPreprocessor !== 'undefined') {
            preprocessado = PhishGuardPreprocessor.analisarUrl(urlCompleta);
            PhishGuardPreprocessor.imprimirConsoleAnalise(preprocessado, urlCompleta);
        } else {
            console.warn('[PhishGuard] Módulo PhishGuardPreprocessor não encontrado no popup.');
            const hostname = objetoUrl.hostname.toLowerCase();
            preprocessado = {
                status: 'suspeito',
                nivelRisco: 'MÉDIO',
                deveEscalonar: true,
                ameacasDetectadas: ['caracteres_especiais'],
                caracteristicas: { dominio: hostname, dominioExibicao: hostname, naSafeList: false }
            };
        }

        analiseAtual = preprocessado;

        // Oculta código Punycode xn--... exibindo o domínio limpo amigável original
        const dominioExibicao = (preprocessado.caracteristicas && preprocessado.caracteristicas.dominioExibicao) 
            ? preprocessado.caracteristicas.dominioExibicao 
            : objetoUrl.hostname;

        const dominioParaBackend = preprocessado.caracteristicas ? preprocessado.caracteristicas.dominio : objetoUrl.hostname;

        // Aviso de privacidade ao remover parâmetros de URL
        if (objetoUrl.pathname.length > 1 || objetoUrl.search) {
            exibirValidacao('lock', ICONS ? ICONS.lock : '🔒', 'Removendo parâmetros pessoais da URL para análise segura.');
        }

        // Exibe o card de análise local com o domínio amigável limpo
        analysisCard.classList.remove('hidden');
        if (resetBtn) resetBtn.classList.remove('hidden');
        currentDomainEl.textContent = dominioExibicao;

        // Exibe o botão de explicação se houver ameaças detectadas
        if (preprocessado.ameacasDetectadas && preprocessado.ameacasDetectadas.length > 0 && btnExplicarAmeaca) {
            btnExplicarAmeaca.classList.remove('hidden');
        } else if (btnExplicarAmeaca) {
            btnExplicarAmeaca.classList.add('hidden');
        }

        if (preprocessado.deveEscalonar) {
            statusBadgeEl.textContent = `SUSPEITO (${preprocessado.nivelRisco})`;
            statusBadgeEl.className = 'status-badge danger';
            iconLoading.classList.remove('hidden');
            await comunicarBackend(dominioParaBackend, urlCompleta, preprocessado);
        } else {
            iconLoading.classList.add('hidden');
            if (preprocessado.caracteristicas && preprocessado.caracteristicas.naSafeList) {
                statusBadgeEl.textContent = 'SEGURO (SAFE LIST)';
            } else {
                statusBadgeEl.textContent = 'SEGURO (LOCAL)';
            }
            statusBadgeEl.className = 'status-badge safe';
            apiIndicator.className = 'status-dot offline';
            apiText.textContent = 'Análise de backend não requerida';
        }
    });

    /**
     * Envia os dados sanitizados para verificação no backend Flask
     */
    async function comunicarBackend(dominio, urlCompleta, preprocessado) {
        try {
            console.log(`[PhishGuard] Enviando domínio para análise backend: ${dominio}`);
            const resposta = await fetch(ENDPOINT_BACKEND, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: dominio, full_url: urlCompleta })
            });

            iconLoading.classList.add('hidden');

            if (resposta.ok) {
                const dados = await resposta.json();
                console.log('[PhishGuard] Resposta do backend:', dados);

                apiIndicator.className = 'status-dot online';
                apiText.textContent = 'Servidor Ativo';

                if (dados.status === 'perigo') {
                    statusBadgeEl.textContent = dados.alvo ? `PERIGO (${dados.alvo})` : 'PERIGO (PHISHING)';
                    statusBadgeEl.className = 'status-badge danger';
                } else if (dados.status === 'seguro') {
                    statusBadgeEl.textContent = 'SEGURO (BACKEND)';
                    statusBadgeEl.className = 'status-badge safe';
                }
            } else {
                throw new Error(`Servidor respondeu com status ${resposta.status}`);
            }
        } catch (erro) {
            console.error('[PhishGuard] Comunicação com o Flask falhou:', erro);
            iconLoading.classList.add('hidden');
            apiIndicator.className = 'status-dot offline';
            apiText.textContent = 'Backend Offline';

            statusBadgeEl.textContent = `SUSPEITO LOCAL (${preprocessado.nivelRisco})`;
            statusBadgeEl.className = 'status-badge danger';
        }
    }
});
