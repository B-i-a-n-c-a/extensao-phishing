/**
 * Módulo de Triagem de URLs - PhishGuard
 * Realiza pré-processamento local, sanitização, detecção de portas não padrão,
 * identificação precisa de alfabetos (Cirílico, Grego, Armênio), extração de domínio limpo
 * para exibição e mapeamento de ameaças didáticas.
 */
(function (global) {
  // Lista de domínios conhecidos e seguros que não necessitam de escalonamento imediato
  const LISTA_SEGURA = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'ufop.br',
    'gov.br',
    'edu.br',
    'itau.com.br',
    'bradesco.com.br',
    'bb.com.br',
    'nubank.com.br',
    'mercadolivre.com.br',
    'amazon.com.br',
    'magazineluiza.com.br',
    'google.com',
    'youtube.com'
  ];

  /**
   * Dicionário e intervalos de Unicode para identificação precisa de alfabetos não-latinos
   */
  const HOMOGLYPHS = {
    CIRILICO: {
      nome: 'Cirílico',
      intervalo: /[\u0400-\u04FF]/
    },
    GREGO: {
      nome: 'Grego',
      intervalo: /[\u0370-\u03FF]/
    },
    ARMENIO: {
      nome: 'Armênio',
      intervalo: /[\u0530-\u058F\u0500-\u052F\u0250-\u02AF]/
    }
  };

  /**
   * Normaliza um hostname removendo espaços e convertendo para minúsculas
   */
  function normalizarDominio(hostname) {
    return (hostname || '').toLowerCase().trim();
  }

  /**
   * Extrai o domínio principal/base a partir do hostname
   */
  function obterDominioBase(hostname) {
    const normalizado = normalizarDominio(hostname);
    if (!normalizado) return '';
    const partes = normalizado.split('.').filter(Boolean);

    if (partes.length <= 2) {
      return normalizado;
    }

    const ultimasDuas = partes.slice(-2).join('.');
    if (['com.br', 'gov.br', 'edu.br', 'org.br', 'net.br'].includes(ultimasDuas) && partes.length >= 3) {
      return partes.slice(-3).join('.');
    }

    return partes.slice(-2).join('.');
  }

  /**
   * Verifica se um domínio está na lista de domínios seguros (Safe List)
   */
  function ehDominioSeguro(hostname) {
    const normalizado = normalizarDominio(hostname);
    if (!normalizado) return false;

    return LISTA_SEGURA.some(itemSeguro => {
      return normalizado === itemSeguro || normalizado.endsWith('.' + itemSeguro);
    });
  }

  /**
   * Detecta todas as famílias de alfabetos não-latinos presentes na string original
   */
  function detectarAlfabetos(texto) {
    if (!texto || typeof texto !== 'string') return [];

    const alfabetos = new Set();
    for (const char of texto) {
      if (HOMOGLYPHS.CIRILICO.intervalo.test(char)) {
        alfabetos.add('CIRILICO');
      }
      if (HOMOGLYPHS.GREGO.intervalo.test(char)) {
        alfabetos.add('GREGO');
      }
      if (HOMOGLYPHS.ARMENIO.intervalo.test(char)) {
        alfabetos.add('ARMENIO');
      }
    }

    return Array.from(alfabetos);
  }

  /**
   * Extrai o domínio amigável original para exibição na UI (ocultando xn--)
   */
  function extrairDominioExibicao(inputUrl) {
    if (!inputUrl || typeof inputUrl !== 'string') return '';
    let limpo = inputUrl.trim();

    limpo = limpo.replace(/^([a-z][a-z\d+\-.]*):\/\//i, '');
    limpo = limpo.split('@').pop();
    limpo = limpo.split('/')[0].split('?')[0].split('#')[0];

    return limpo.toLowerCase();
  }

  /**
   * Extrai e sanitiza o protocolo, hostname e porta de uma URL
   */
  function sanitizarUrl(inputUrl) {
    if (!inputUrl || typeof inputUrl !== 'string') {
      return {
        protocolo: '',
        protocol: '',
        hostname: '',
        porta: '',
        dominioExibicao: '',
        sanitizedUrl: '',
        erro: 'URL inválida ou vazia',
        error: 'URL inválida ou vazia'
      };
    }

    let urlParaParse = inputUrl.trim();
    let protocolo = 'http:';
    let hostname = '';
    let porta = '';

    if (!/^([a-z][a-z\d+\-.]*):\/\//i.test(urlParaParse)) {
      urlParaParse = 'http://' + urlParaParse;
    }

    try {
      const parsed = new URL(urlParaParse);
      protocolo = parsed.protocol || protocolo;
      hostname = normalizarDominio(parsed.hostname);
      porta = parsed.port || '';
    } catch (error) {
      const matchProtocolo = urlParaParse.match(/^([a-z][a-z\d+\-.]*):\/\//i);
      if (matchProtocolo) {
        protocolo = matchProtocolo[1].toLowerCase() + ':';
      }

      const matchHost = urlParaParse.match(/^(?:[a-z][a-z\d+\-.]*:\/\/)?([^\/?#]+)/i);
      if (matchHost) {
        const hostEPorta = matchHost[1].split('@').pop();
        const partesHostPorta = hostEPorta.split(':');
        hostname = normalizarDominio(partesHostPorta[0]);
        if (partesHostPorta.length > 1) {
          porta = partesHostPorta[1].replace(/\D/g, '');
        }
      } else {
        return {
          protocolo: '',
          protocol: '',
          hostname: '',
          porta: '',
          dominioExibicao: '',
          sanitizedUrl: '',
          erro: error.message,
          error: error.message
        };
      }
    }

    const dominioExibicao = extrairDominioExibicao(inputUrl);
    const sanitizedUrl = `${protocolo}//${hostname}${porta ? ':' + porta : ''}`;

    const objetoSanitizado = {
      protocolo: protocolo,
      protocol: protocolo,
      hostname: hostname,
      porta: porta,
      dominioExibicao: dominioExibicao,
      sanitizedUrl: sanitizedUrl,
      erro: null,
      error: null
    };

    objetoSanitizado.sanitized = {
      protocol: protocolo,
      hostname: hostname,
      port: porta,
      sanitizedUrl: sanitizedUrl,
      error: null
    };

    return objetoSanitizado;
  }

  /**
   * Emite logs de análise formatados no console conforme especificado em parte1_modulo_deteccao_base.md
   */
  function imprimirConsoleAnalise(analise, urlOriginal) {
    console.log(`[PhishGuard] Processando URL: ${urlOriginal || analise.sanitizedUrl}`);
    console.log(`[PhishGuard] URL sanitizada: ${analise.sanitizedUrl}`);
    console.log('[PhishGuard] Características extraídas:', JSON.stringify(analise.caracteristicas, null, 2));
    console.log('═══════════════════════════════════════════════════');
    console.log('[PhishGuard] 📊 RESULTADO DA ANÁLISE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📌 Status: ${analise.statusFormatado}`);
    console.log(`🎯 Nível de Suspeita: ${analise.pontuacaoSuspeita}%`);
    console.log(`🏷️ Nível de Risco: ${analise.nivelRisco}`);
    console.log('───────────────────────────────────────────────────');
    console.log('📋 Regras Ativadas:');
    if (analise.regrasAtivadas && analise.regrasAtivadas.length > 0) {
      analise.regrasAtivadas.forEach(regra => console.log(`  ${regra}`));
    } else {
      console.log('  ✅ Nenhuma regra suspeita ativada');
    }
    if (analise.ameacasDetectadas && analise.ameacasDetectadas.length > 0) {
      console.log(`💡 Ameaças didáticas mapeadas: ${analise.ameacasDetectadas.join(', ')}`);
    }
    console.log('───────────────────────────────────────────────────');
    if (analise.deveEscalonar) {
      console.log('🚨 ALERTA: URL suspeita! Enviando para backend...');
    }
    console.log('═══════════════════════════════════════════════════');
  }

  /**
   * Realiza a análise heurística completa da URL e mapeia os tipos de ameaça didática
   */
  function analisarUrl(inputUrl) {
    const sanitizado = sanitizarUrl(inputUrl);
    const urlOriginal = (inputUrl || '').trim();

    if (sanitizado.erro) {
      const resultadoErro = {
        status: 'erro',
        statusFormatado: '❌ URL inválida',
        nivelRisco: 'ALTO',
        riskLevel: 'ALTO',
        pontuacaoSuspeita: 100,
        suspicionScore: 100,
        deveEscalonar: true,
        shouldEscalate: true,
        regrasAtivadas: ['🔴 URL inválida ou malformada'],
        rulesActivated: ['🔴 URL inválida ou malformada'],
        ameacasDetectadas: ['caracteres_especiais'],
        caracteristicas: {
          dominio: '',
          dominioExibicao: '',
          comprimento: 0,
          ehPunycode: false,
          alfabetosDetectados: [],
          alfabetoDetectado: null,
          temCaracteresEspeciais: false,
          temSubdominios: 0,
          contemNumero: false,
          naSafeList: false,
          possuiTraco: false,
          possuiPontuacaoExcessiva: false
        },
        sanitizedUrl: '',
        sanitized: sanitizado
      };
      resultadoErro.features = resultadoErro.caracteristicas;
      return resultadoErro;
    }

    const hostname = sanitizado.hostname;
    const porta = sanitizado.porta;
    const alfabetosDetectados = detectarAlfabetos(urlOriginal);
    const ehPunycode = hostname.includes('xn--') || alfabetosDetectados.length > 0 || /[^\x00-\x7F]/.test(urlOriginal);
    const possuiTraco = hostname.includes('-');
    const partesHostname = hostname.split('.');
    
    const ultimasDuas = partesHostname.slice(-2).join('.');
    const ehCcTld = ['com.br', 'gov.br', 'edu.br', 'org.br', 'net.br'].includes(ultimasDuas);
    const quantidadeSubdominios = Math.max(0, partesHostname.length - (ehCcTld ? 3 : 2));

    const temCaracteresEspeciais = /[^a-z0-9.-]/.test(hostname) || /[@#$%^&*]/.test(urlOriginal);
    const contemNumero = /\d/.test(hostname);

    const ehLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const naSafeList = ehDominioSeguro(hostname) && (!porta || ['80', '443'].includes(porta));
    const possuiPontuacaoExcessiva = (hostname.match(/\./g) || []).length > 3 || (hostname.match(/-/g) || []).length > 2;
    const ehUrlLonga = urlOriginal.length > 70 || hostname.length > 30;
    const semHttps = sanitizado.protocolo === 'http:';

    const possuiPortaNaoPadrao = Boolean(porta && !['80', '443'].includes(porta));

    const caracteristicas = {
      dominio: hostname,
      dominioExibicao: sanitizado.dominioExibicao || hostname,
      comprimento: urlOriginal.length,
      ehPunycode: ehPunycode,
      alfabetosDetectados: alfabetosDetectados,
      alfabetoDetectado: alfabetosDetectados.length > 0 ? alfabetosDetectados[0].toLowerCase() : null,
      temCaracteresEspeciais: temCaracteresEspeciais,
      temSubdominios: quantidadeSubdominios,
      contemNumero: contemNumero,
      naSafeList: naSafeList,
      possuiTraco: possuiTraco,
      possuiPontuacaoExcessiva: possuiPontuacaoExcessiva,
      semHttps: semHttps,
      porta: porta,
      possuiPortaNaoPadrao: possuiPortaNaoPadrao,
      ehLocalhost: ehLocalhost
    };

    const features = {
      hostname: hostname,
      displayDomain: sanitizado.dominioExibicao || hostname,
      isPunycode: ehPunycode,
      detectedAlphabets: alfabetosDetectados,
      detectedAlphabet: alfabetosDetectados.length > 0 ? alfabetosDetectados[0].toLowerCase() : null,
      hasHyphen: possuiTraco,
      subdomainCount: quantidadeSubdominios,
      hasSpecialCharacters: temCaracteresEspeciais,
      hasNumber: contemNumero,
      isSafeList: naSafeList,
      hasExcessivePunctuation: possuiPontuacaoExcessiva,
      noHttps: semHttps,
      port: porta,
      hasNonStandardPort: possuiPortaNaoPadrao
    };

    const regrasAtivadas = [];
    const ameacasSet = new Set();
    let pontuacaoSuspeita = 0;

    if (possuiPortaNaoPadrao) {
      pontuacaoSuspeita += 45;
      regrasAtivadas.push(`🟡 Porta não padrão detectada (${porta})`);
      ameacasSet.add('porta_suspeita');
    }

    if (naSafeList) {
      if (!possuiPortaNaoPadrao) {
        pontuacaoSuspeita = 0;
      }
    } else {
      if (ehPunycode) {
        pontuacaoSuspeita += 70;
        regrasAtivadas.push('🔴 Domínio com código Punycode / Letras de outro alfabeto');
        ameacasSet.add('punycode');
      }

      if (possuiTraco) {
        pontuacaoSuspeita += 20;
        regrasAtivadas.push('🟡 Domínio contém traço (-) - possível imitação');
        ameacasSet.add('dominio_parecido');
      }

      if (quantidadeSubdominios >= 2) {
        pontuacaoSuspeita += 20;
        regrasAtivadas.push(`🟡 Domínio com estrutura de subdomínio complexa (${quantidadeSubdominios})`);
        ameacasSet.add('redirecionamentos');
      }

      if (temCaracteresEspeciais) {
        pontuacaoSuspeita += 15;
        regrasAtivadas.push('🟡 Caracteres especiais no domínio ou URL');
        ameacasSet.add('caracteres_especiais');
      }

      if (ehUrlLonga) {
        pontuacaoSuspeita += 15;
        regrasAtivadas.push('🟡 URL excessivamente longa');
        ameacasSet.add('url_longa');
      }

      if (semHttps && !possuiPortaNaoPadrao) {
        pontuacaoSuspeita += 15;
        regrasAtivadas.push('🟡 Conexão sem criptografia HTTPS');
        ameacasSet.add('sem_https');
      }

      if (contemNumero) {
        pontuacaoSuspeita += 10;
        regrasAtivadas.push('🟡 Domínio contém números');
      }

      if (possuiPontuacaoExcessiva) {
        pontuacaoSuspeita += 10;
        regrasAtivadas.push('🟡 Domínio com pontuação ou tamanho excessivo');
        if (!ameacasSet.has('caracteres_especiais')) {
          ameacasSet.add('caracteres_especiais');
        }
      }

      if (regrasAtivadas.length === 0) {
        pontuacaoSuspeita += 5;
        regrasAtivadas.push('🟡 Domínio fora da Safe List');
        ameacasSet.add('dominio_novo');
      }
    }

    pontuacaoSuspeita = Math.min(100, pontuacaoSuspeita);
    const deveEscalonar = (!naSafeList && pontuacaoSuspeita >= 30) || possuiPortaNaoPadrao;

    let status = 'seguro';
    let statusFormatado = '✅ Domínio seguro (Safe List)';
    let nivelRisco = 'BAIXO';

    if (!naSafeList || possuiPortaNaoPadrao) {
      if (deveEscalonar) {
        status = 'suspeito';
        statusFormatado = '⚠️ URL com características suspeitas';
      } else {
        status = 'seguro';
        statusFormatado = '✅ URL com baixa suspeição';
      }

      if (pontuacaoSuspeita >= 70) {
        nivelRisco = 'ALTO';
      } else if (pontuacaoSuspeita >= 40) {
        nivelRisco = 'MÉDIO';
      } else {
        nivelRisco = 'BAIXO';
      }
    }

    const ameacasDetectadas = Array.from(ameacasSet);

    const resultadoFinal = {
      status: status,
      statusFormatado: statusFormatado,
      nivelRisco: nivelRisco,
      riskLevel: nivelRisco,
      pontuacaoSuspeita: pontuacaoSuspeita,
      suspicionScore: pontuacaoSuspeita,
      deveEscalonar: deveEscalonar,
      shouldEscalate: deveEscalonar,
      regrasAtivadas: regrasAtivadas,
      rulesActivated: regrasAtivadas,
      ameacasDetectadas: ameacasDetectadas,
      caracteristicas: caracteristicas,
      features: features,
      sanitizedUrl: sanitizado.sanitizedUrl,
      sanitized: sanitizado
    };

    return resultadoFinal;
  }

  // Exportação CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      HOMOGLYPHS,
      LISTA_SEGURA,
      SAFE_LIST: LISTA_SEGURA,
      sanitizarUrl,
      sanitizeUrl: sanitizarUrl,
      analisarUrl,
      analyzeUrl: analisarUrl,
      ehDominioSeguro,
      isDomainSafe: ehDominioSeguro,
      detectarAlfabetos,
      imprimirConsoleAnalise
    };
  }

  // Exportação global
  const escopoGlobal = typeof globalThis !== 'undefined' ? globalThis : this;
  const API_PHISHGUARD = {
    HOMOGLYPHS,
    LISTA_SEGURA,
    SAFE_LIST: LISTA_SEGURA,
    sanitizarUrl,
    sanitizeUrl: sanitizarUrl,
    analisarUrl,
    analyzeUrl: analisarUrl,
    ehDominioSeguro,
    isDomainSafe: ehDominioSeguro,
    detectarAlfabetos,
    imprimirConsoleAnalise
  };

  escopoGlobal.PhishGuardPreprocessor = API_PHISHGUARD;
  escopoGlobal.PhisGuardPreprocessor = API_PHISHGUARD;
})(typeof globalThis !== 'undefined' ? globalThis : this);
