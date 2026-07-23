(function (global) {
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

  const EXPLICACOES_AMEACAS = {
    punycode: {
      chave: 'punycode',
      titulo: 'Atenção! Cópia Falsa de Site Famoso',
      iconeChave: 'DOMINIO_PARECIDO',
      nivelRisco: 'ALTO',
      corRisco: 'danger',
      resumo: 'Este endereço parece de um site famoso, mas contém letras de outro alfabeto!',
      oQueSignifica: 'Golpistas usaram letras de alfabetos estrangeiros para criar um endereço que PARECE idêntico a um site confiável, mas é falso.',
      porQueEPerigoso: [
        'Você pensa que está no site verdadeiro',
        'Mas está num site falso criado por hackers',
        'Se você digitar sua senha ou dados, os golpistas vão roubá-los',
        'Sua conta ou informações financeiras podem ser invadidas'
      ],
      dicasSeguranca: [
        'NUNCA digite sua senha neste site',
        'Feche esta página imediatamente',
        'Digite o endereço manualmente no navegador',
        'Desconfie de letras estranhas no endereço'
      ],
      exemplo: '"fаcеbооk.com" (com letras cirílicas) parece "facebook.com" mas é um golpe! As letras "а" e "е" são do alfabeto cirílico.'
    },

    porta_suspeita: {
      chave: 'porta_suspeita',
      titulo: 'Conexão Não Segura com Porta Suspeita',
      iconeChave: 'PORTA_SUSPEITA',
      nivelRisco: 'MÉDIO',
      corRisco: 'warning',
      resumo: 'Esta URL está usando uma porta incomum e não tem o cadeado de segurança HTTPS.',
      oQueSignifica: 'Endereços da internet normalmente usam portas padrão (80 para HTTP e 443 para HTTPS). Esta URL usa uma porta INCOMUM e SUSPEITA!',
      porQueEPerigoso: [
        'Portas não padrão são frequentemente usadas por servidores maliciosos que roubam dados',
        'Podem ser ferramentas de invasão (como Metasploit) ou malwares C2',
        'Programas espiões que controlam seu computador usam essas portas',
        'Sem HTTPS, suas informações viajam abertas na internet e podem ser interceptadas'
      ],
      dicasSeguranca: [
        'Desconfie de portas incomuns (ex: 444, 1337, 8080, 666)',
        'Procure sempre a criptografia HTTPS na barra de endereços',
        'NUNCA insira dados em sites com portas suspeitas sem HTTPS',
        'Se aparecer "localhost" com porta estranha, pode ser um programa malicioso rodando no seu computador'
      ],
      exemplo: '"http://localhost:444" é suspeito porque usa porta 444 (usada por invasores) e não possui criptografia HTTPS.'
    },

    url_longa: {
      chave: 'url_longa',
      titulo: 'URL Excessivamente Longa',
      iconeChave: 'URL_LONGA',
      nivelRisco: 'MÉDIO',
      corRisco: 'warning',
      resumo: 'Esta URL é muito mais longa do que o normal.',
      oQueSignifica: 'O endereço é muito longo, o que pode esconder o verdadeiro destino do link.',
      porQueEPerigoso: [
        'Golpistas escondem o site falso no meio da URL',
        'Você pode achar que está num site confiável',
        'Mas na verdade está sendo redirecionado para outro'
      ],
      dicasSeguranca: [
        'Olhe sempre o FINAL da URL',
        'O que importa é o domínio principal (.com, .br, etc)',
        'URLs legítimas raramente são muito longas'
      ],
      exemplo: '"https://google.com/login?redirect=...hackersite.com" — O final "hackersite.com" é o site real!'
    },

    caracteres_especiais: {
      chave: 'caracteres_especiais',
      titulo: 'Caracteres Suspeitos Detectados',
      iconeChave: 'ATENCAO',
      nivelRisco: 'MÉDIO',
      corRisco: 'warning',
      resumo: 'Esta URL contém caracteres que não são comuns em endereços da internet.',
      oQueSignifica: 'A URL usa caracteres que não são normais em endereços da internet, como @, #, $, % ou &.',
      porQueEPerigoso: [
        'Golpistas usam esses caracteres para enganar',
        'Podem esconder para onde você está sendo enviado',
        'Alguns caracteres podem coletar seus dados'
      ],
      dicasSeguranca: [
        'URLs de sites confiáveis são simples e diretas',
        'Exemplo bom: "https://seubanco.com.br/login"',
        'Exemplo suspeito: "https://banco.com@hacker.com"',
        'Se parecer confuso, provavelmente é golpe!'
      ],
      exemplo: 'https://banco.com@hacker.com (o símbolo @ redireciona para o site do hacker)'
    },

    dominio_parecido: {
      chave: 'dominio_parecido',
      titulo: 'Atenção! Domínio Suspeito',
      iconeChave: 'DOMINIO_PARECIDO',
      nivelRisco: 'ALTO',
      corRisco: 'danger',
      resumo: 'Este endereço parece muito com um site famoso, mas tem pequenas diferenças.',
      oQueSignifica: 'O endereço deste site é muito parecido com o de um site famoso, mas tem pequenas diferenças.',
      porQueEPerigoso: [
        'Golpistas criam cópias de sites famosos',
        'Você pode achar que está num site confiável',
        'Mas na verdade estão tentando roubar seus dados'
      ],
      dicasSeguranca: [
        'SEMPRE confira se o endereço é exatamente igual',
        'Note: "google.com" ≠ "g00gle.com"',
        'Note: "paypal.com" ≠ "pay-pal.com"',
        'Se tiver dúvida, digite o site manualmente no navegador'
      ],
      exemplo: 'Golpes comuns: "faceb00k.com" (zero no lugar do o), "mercado-livre-seguro.com", "goggle.com"'
    },

    sem_https: {
      chave: 'sem_https',
      titulo: 'Conexão Não Segura',
      iconeChave: 'SEM_HTTPS',
      nivelRisco: 'MÉDIO',
      corRisco: 'warning',
      resumo: 'Esta URL não usa o protocolo HTTPS, que é o padrão de segurança da internet.',
      oQueSignifica: 'Este site não tem o "cadeado" de segurança no navegador.',
      porQueEPerigoso: [
        'Suas informações viajam "abertas" na internet',
        'Golpistas podem ver o que você está enviando',
        'Senhas, dados pessoais e cartões podem ser roubados'
      ],
      dicasSeguranca: [
        'Procure a criptografia HTTPS na barra de endereços',
        'Sites seguros começam com "https://"',
        'NUNCA envie dados em sites com "http://" (sem o "s")',
        'Bancos e lojas confiáveis NUNCA usam HTTP'
      ],
      exemplo: 'https:// = Seguro ✓  |  http:// = Inseguro ✗'
    },

    dominio_novo: {
      chave: 'dominio_novo',
      titulo: 'Domínio Muito Novo',
      iconeChave: 'DOMINIO_NOVO',
      nivelRisco: 'MÉDIO',
      corRisco: 'warning',
      resumo: 'Este domínio foi criado recentemente, o que é uma característica comum em sites falsos.',
      oQueSignifica: 'O endereço deste site foi registrado há muito pouco tempo, o que é incomum para sites confiáveis.',
      porQueEPerigoso: [
        'Golpistas criam sites novos a todo momento',
        'Eles usam sites "frescos" para aplicar golpes',
        'Depois que são descobertos, criam outros'
      ],
      dicasSeguranca: [
        'Bancos e lojas confiáveis têm domínios antigos',
        'Se o site não parece familiar, pesquise sobre ele',
        'Mercado Livre existe há décadas',
        'mercado-livre-seguro.com criado ontem = GOLPE!'
      ],
      exemplo: '✅ "amazon.com" - existe desde 1994  |  ✗ "amazon-seguro.com" - criado hoje - GOLPE!'
    },

    redirecionamentos: {
      chave: 'redirecionamentos',
      titulo: 'Múltiplos Redirecionamentos',
      iconeChave: 'REDIRECIONAMENTO',
      nivelRisco: 'ALTO',
      corRisco: 'danger',
      resumo: 'Esta URL parece levar a vários outros endereços antes de chegar no destino final.',
      oQueSignifica: 'Este link pode te levar por vários sites diferentes antes de chegar no destino final.',
      porQueEPerigoso: [
        'Golpistas escondem o site final verdadeiro',
        'Você pode achar que está num site confiável',
        'Na verdade está sendo enviado para um site falso'
      ],
      dicasSeguranca: [
        'Preste atenção no endereço FINAL da barra',
        'Se o endereço final for diferente do esperado, feche',
        'Links confiáveis geralmente vão direto ao destino'
      ],
      exemplo: 'Clicou num link do Mercado Livre? Passou por "bit.ly"? Chegou num endereço estranho? = GOLPE!'
    }
  };

  /**
   * Gerador dinâmico de exemplo prático por alfabeto (Cirílico, Grego, Armênio ou Múltiplos)
   */
  function gerarExemploPratico(url, alfabetosDetectados, dominioExibicao) {
    const exemplos = {
      CIRILICO: {
        texto: '"fаcеbооk.com" - Onde "а" e "е" são letras do alfabeto cirílico, mas parecem exatamente com as letras latinas "a" e "e". Isso faz o endereço parecer "facebook.com" mas é um golpe!'
      },
      GREGO: {
        texto: '"paypal.ςom" - Onde "ς" (sigma minúsculo grego) parece a letra "c" do nosso alfabeto, mas é uma letra grega. Isso faz o endereço parecer "paypal.com" mas é um golpe!'
      },
      ARMENIO: {
        texto: '"fɑcebook.com" / "amazon.соm" - Onde "ɑ" ou "о" são letras do alfabeto armênio, mas parecem com as letras do nosso alfabeto. Isso faz o endereço parecer um site legítimo mas é um golpe!'
      }
    };

    if (Array.isArray(alfabetosDetectados) && alfabetosDetectados.length > 1) {
      const nomes = alfabetosDetectados.map(a => HOMOGLYPHS[a] ? HOMOGLYPHS[a].nome.toLowerCase() : a.toLowerCase()).join(' e ');
      return `Esta URL contém caracteres dos alfabetos ${nomes} misturados, fazendo parecer um site legítimo mas sendo um golpe!`;
    }

    if (Array.isArray(alfabetosDetectados) && alfabetosDetectados.length === 1) {
      const alfa = alfabetosDetectados[0];
      if (exemplos[alfa]) {
        return exemplos[alfa].texto;
      }
    }

    return `"${dominioExibicao || 'site-falso.com'}" contém caracteres de outro alfabeto, fazendo parecer um site legítimo mas sendo um golpe!`;
  }

  /**
   * Obtém os dados explicativos formatados dinamicamente com base nas características encontradas
   */
  function obterExplicacaoDinamica(chaveAmeaca, caracteristicas) {
    const base = EXPLICACOES_AMEACAS[chaveAmeaca];
    if (!base) return null;

    const copia = JSON.parse(JSON.stringify(base));
    const carac = caracteristicas || {};

    if (chaveAmeaca === 'punycode') {
      const alfabetos = carac.alfabetosDetectados || (carac.alfabetoDetectado ? [carac.alfabetoDetectado.toUpperCase()] : []);
      copia.exemplo = gerarExemploPratico(carac.dominioExibicao || '', alfabetos, carac.dominioExibicao);
    }

    if (chaveAmeaca === 'porta_suspeita' && carac.porta) {
      copia.resumo = `Esta URL está usando uma porta incomum (${carac.porta}) e não tem o cadeado de segurança HTTPS.`;
      copia.exemplo = `"http://${carac.dominioExibicao || 'localhost:' + carac.porta}" é suspeito porque usa porta incomum (${carac.porta}) e não possui criptografia HTTPS.`;
    }

    return copia;
  }

  // Exportação CommonJS (Node.js)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      HOMOGLYPHS,
      EXPLICACOES_AMEACAS,
      obterExplicacao: (chave) => EXPLICACOES_AMEACAS[chave] || null,
      obterExplicacaoAmeaca: obterExplicacaoDinamica,
      obterExplicacaoDinamica,
      gerarExemploPratico
    };
  }

  // Exportação Global para o navegador
  const escopoGlobal = typeof globalThis !== 'undefined' ? globalThis : this;
  escopoGlobal.HOMOGLYPHS = HOMOGLYPHS;
  escopoGlobal.EXPLICACOES_AMEACAS = EXPLICACOES_AMEACAS;
  escopoGlobal.gerarExemploPratico = gerarExemploPratico;
  escopoGlobal.obterExplicacaoAmeaca = (chave, caracteristicas) => obterExplicacaoDinamica(chave, caracteristicas);
})(typeof globalThis !== 'undefined' ? globalThis : this);
