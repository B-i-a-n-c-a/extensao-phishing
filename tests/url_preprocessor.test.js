const test = require('node:test');
const assert = require('node:assert/strict');
const preprocessor = require('../scripts_js/url_preprocessor.js');
const explicacoes = require('../scripts_js/explicacoes_ameacas.js');

const { analisarUrl, sanitizarUrl, analyzeUrl, detectarAlfabetos } = preprocessor;

test('sanitiza URLs mantendo apenas o hostname para análise', () => {
  const result = sanitizarUrl('https://www.google.com/search?q=teste&lang=pt');

  assert.equal(result.protocolo, 'https:');
  assert.equal(result.hostname, 'www.google.com');
  assert.equal(result.sanitizedUrl, 'https://www.google.com');
});

test('sanitiza URLs sem protocolo adicionando protocolo padrão http', () => {
  const result = sanitizarUrl('www.google.com/search?q=teste');

  assert.equal(result.protocolo, 'http:');
  assert.equal(result.hostname, 'www.google.com');
});

test('marca URLs seguras na Safe List como baixa suspeita e sem escalonamento', () => {
  const result = analisarUrl('https://www.google.com/search?q=teste');

  assert.equal(result.status, 'seguro');
  assert.equal(result.nivelRisco, 'BAIXO');
  assert.equal(result.pontuacaoSuspeita, 0);
  assert.equal(result.deveEscalonar, false);
});

test('reconhece sufixos institucionais brasileiros na Safe List (.ufop.br, .gov.br)', () => {
  const resultUfop = analisarUrl('https://portal.ufop.br/aluno');
  assert.equal(resultUfop.caracteristicas.naSafeList, true);
  assert.equal(resultUfop.deveEscalonar, false);

  const resultGov = analisarUrl('https://sisu.gov.br');
  assert.equal(resultGov.caracteristicas.naSafeList, true);
  assert.equal(resultGov.deveEscalonar, false);
});

test('detecta porta não padrão (ex: http://localhost:444) e marca como suspeita (Parte 3)', () => {
  const result = analisarUrl('http://localhost:444');

  assert.equal(result.caracteristicas.possuiPortaNaoPadrao, true);
  assert.equal(result.caracteristicas.porta, '444');
  assert.ok(result.ameacasDetectadas.includes('porta_suspeita'));
  assert.equal(result.deveEscalonar, true);

  const explicacao = explicacoes.obterExplicacaoAmeaca('porta_suspeita', result.caracteristicas);
  assert.equal(explicacao.titulo, 'Conexão Não Segura com Porta Suspeita');
  assert.match(explicacao.resumo, /444/);
});

test('oculta código Punycode xn-- do domínio de exibição do usuário (Parte 3)', () => {
  const result = analisarUrl('www.mеrcadolivre.com/login');

  assert.equal(result.caracteristicas.ehPunycode, true);
  assert.equal(result.caracteristicas.dominio, 'www.xn--mrcadolivre-okj.com');
  assert.equal(result.caracteristicas.dominioExibicao.includes('xn--'), false);
  assert.ok(result.caracteristicas.dominioExibicao.includes('mеrcadolivre'));
});

test('detecta corretamente caracteres do Alfabeto Armênio (Bug 1 Fix)', () => {
  // Teste 1: https://fɑcebook.com (letra ɑ armênia U+0511)
  const result1 = analisarUrl('https://fɑcebook.com');
  assert.ok(result1.caracteristicas.alfabetosDetectados.includes('ARMENIO'));

  // Teste 2: https://googlҽ.com (letra ҽ U+04BD Abkhasian Che / Armênia)
  const result2 = analisarUrl('https://googlҽ.com');
  assert.ok(result2.caracteristicas.alfabetosDetectados.includes('ARMENIO') || result2.caracteristicas.alfabetosDetectados.includes('CIRILICO'));

  // Teste 3: https://paypɑl.com (letra ɑ armênia U+0511)
  const result3 = analisarUrl('https://paypɑl.com');
  assert.ok(result3.caracteristicas.alfabetosDetectados.includes('ARMENIO'));

  const expArmenio = explicacoes.obterExplicacaoAmeaca('punycode', result1.caracteristicas);
  assert.match(expArmenio.exemplo, /armênio/i);
});

test('identifica especificamente os alfabetos Cirílico, Grego e Armênio em URLs', () => {
  const resultCirilico = analisarUrl('https://fаcеbооk.com');
  assert.ok(resultCirilico.caracteristicas.alfabetosDetectados.includes('CIRILICO'));

  const resultGrego = analisarUrl('https://paypal.ςom');
  assert.ok(resultGrego.caracteristicas.alfabetosDetectados.includes('GREGO'));
  const expGrego = explicacoes.obterExplicacaoAmeaca('punycode', resultGrego.caracteristicas);
  assert.match(expGrego.exemplo, /grego/i);
});

test('identifica traços e múltiplos subdomínios como suspeitos', () => {
  const result = analisarUrl('https://banco.seguro.click-bait.com.br/conta');

  assert.equal(result.caracteristicas.possuiTraco, true);
  assert.equal(result.caracteristicas.temSubdominios >= 2, true);
  assert.equal(result.deveEscalonar, true);
});

test('mantém retrocompatibilidade com a API legada em inglês', () => {
  const result = analyzeUrl('https://www.google.com/search?q=teste');

  assert.equal(result.status, 'seguro');
  assert.equal(result.riskLevel, 'BAIXO');
  assert.equal(result.suspicionScore, 0);
  assert.equal(result.shouldEscalate, false);
  assert.equal(result.features.isSafeList, true);
});
