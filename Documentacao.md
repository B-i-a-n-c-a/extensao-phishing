# Documentação da Estrutura e Funcionamento dos Arquivos - PhishGuard

Este documento descreve detalhadamente a finalidade e a responsabilidade de cada arquivo presente no repositório do projeto **PhishGuard**.

---

## 📁 Arquivos da Raiz do Repositório

### 1. [`manifest.json`]
* **Descrição**: Arquivo de configuração principal da extensão WebExtension (Manifest V3).
* **O que faz**:
  * Define o nome, versão e descrição da extensão.
  * Solicita as permissões necessárias do navegador (`activeTab`, `storage`, `scripting`, `webNavigation`, `sidePanel`).
  * Registra as permissões de acesso ao servidor backend (`http://127.0.0.1:5000/*`).
  * Define o Service Worker de segundo plano ([`background.js`] e o painel lateral/popup.

### 2. [`background.js`]
* **Descrição**: Service Worker que executa continuamente em segundo plano no navegador Chrome/Chromium.
* **O que faz**:
  * Carrega o módulo de pré-processamento [`scripts_js/url_preprocessor.js`]
  * Configura o comportamento do botão da extensão para abrir o painel lateral (Side Panel).
  * Intercepta a navegação em tempo real do usuário via evento `chrome.webNavigation.onBeforeNavigate`.
  * Realiza a triagem local das URLs acessadas antes do carregamento da página e emite logs formatados no console do navegador.

### 3. [`requirements.txt`]
* **Descrição**: Lista de dependências Python necessárias para rodar o backend Flask.
* **O que faz**: Especifica as bibliotecas `Flask` e `flask-cors` que devem ser instaladas no ambiente virtual (`venv`).

### 4. [`README.md`]
* **Descrição**: Documento explicativo inicial do repositório.
* **O que faz**: Apresenta a visão geral do PhishGuard, instruções de instalação do backend, como carregar a extensão no navegador e comandos para executar a suíte de testes.

### 5. [`.gitignore`]
* **Descrição**: Arquivo de regras de exclusão do Git.
* **O que faz**: Impede que arquivos temporários, pastas de ambiente virtual (`venv/`), caches do Python (`__pycache__/`) e dados locais fiquem registrados no histórico do repositório.

---

## 📁 Pasta `scripts_js/` (Módulos JavaScript da Extensão)

### 6. [`scripts_js/url_preprocessor.js`]
* **Descrição**: Módulo central de triagem heurística e pré-processamento de URLs (`PhishGuardPreprocessor`).
* **O que faz**:
  * Sanitiza URLs, extraindo protocolo, hostname e portas.
  * Trata URLs inseridas sem esquema adicionando `http://` para correto parseamento de IDN/Punycode.
  * Oculta códigos técnicos `xn--...` gerando um `dominioExibicao` limpo e amigável.
  * Detecta conexões com portas não padrão (ex: `:444`, `:1337`, `:8080`).
  * Identifica famílias de alfabetos não-latinos (**Cirílico**, **Grego** e **Armênio**).
  * Compara com a lista de domínios seguros (**Safe List**), calcula pontuações de suspeita e decide se a URL deve ser escalonada ao backend Flask.
  * Imprime logs formatados no console do navegador com emojis e estatísticas.

### 7. [`scripts_js/explicacoes_ameacas.js`]
* **Descrição**: Dicionário de explicações didáticas de segurança e formatador dinâmico de ameaças (`EXPLICACOES_AMEACAS`).
* **O que faz**:
  * Armazena os textos educativos em linguagem simples e acessível para leigos cobrindo todas as ameaças:
    1. `punycode` (Cópia falsa de site famoso via homóglifos)
    2. `porta_suspeita` (Conexão não segura com porta incomum)
    3. `url_longa` (URL excessivamente longa)
    4. `caracteres_especiais` (Caracteres incomuns como `@`, `#`, `%`)
    5. `dominio_parecido` (Imitação com traços ou pequenas alterações)
    6. `sem_https` (Conexão HTTP aberta sem criptografia)
    7. `dominio_novo` (Domínio criado recentemente)
    8. `redirecionamentos` (Múltiplos saltos de links)
  * Formata dinamicamente os exemplos práticos de acordo com o alfabeto identificado (Cirílico, Grego ou Armênio) e porta utilizada.

### 8. [`scripts_js/popup.js`]
* **Descrição**: Controlador de lógica da interface gráfica do popup/painel lateral.
* **O que faz**:
  * Gerencia os eventos de clique dos botões (Analisar, Voltar, Abrir/Fechar Modal).
  * Executa a verificação manual de URLs acionando o pré-processador local.
  * Exibe o card de análise local com o domínio amigável limpo (ocultando `xn--...`).
  * Controla a exibição e alternância de abas do **Modal Didático de Explicação de Ameaças**.
  * Comunica-se com o servidor backend Flask (`http://127.0.0.1:5000/api/verify`) quando necessário, tratando graciosamente situações em que o servidor esteja offline.

```
┌─────────────────────────────┐
│   URL analisada localmente  │
│    (variável preprocessado) │
└─────────────┬───────────────┘
              │
              ▼
    ┌─────────────────┐
    │ deveEscalonar?  │
    └────────┬────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   SIM (suspeito)  NÃO (seguro)
      │             │
      ▼             ▼
┌──────────┐  ┌─────────────┐
│ Badge    │  │ Esconde     │
│ "PERIGO" │  │ loading     │
└────┬─────┘  └──────┬──────┘
     │               │
     ▼               ▼
┌──────────┐  ┌─────────────┐
│ Mostra   │  │ Verifica se │
│ loading  │  │ está na     │
└────┬─────┘  │ safe list   │
     │        └──────┬──────┘
     │         ┌─────┴─────┐
     ▼         │           │
┌──────────┐   ▼           ▼
│ Chama    │  SEGURO    SEGURO
│ backend  │  (SAFE     (LOCAL)
└──────────┘  LIST)
```



### 9. [`scripts_js/popup.html`]
* **Descrição**: Estrutura HTML5 da interface do popup/painel lateral.
* **O que faz**:
  * Define a barra superior com o botão "Voltar ao Início" no canto esquerdo.
  * Contém a área de resultado da análise (`#analysis-card`) e o botão de alerta *"Por que esta URL é suspeita?"*.
  * Define o formulário de entrada para verificação manual de URLs.
  * Define o container do **Modal Didático de Explicação de Ameaças** com abas de navegação, seções de explicação e botões de fechar.

### 10. [`scripts_js/popup.css`]
* **Descrição**: Folha de estilos CSS3 da extensão.
* **O que faz**:
  * Define o tema visual escuro (*Dark Mode*) com efeitos neon e plano de fundo dinâmico.
  * Estiliza os cards com efeito *glassmorphism* (`backdrop-filter`).
  * Define os badges de status (Seguro, Suspeito, Perigo, Risco Alto/Médio).
  * Configura o layout responsivo do modal explicativo, das abas de ameaças e dos botões de ação.
  * Aplica tipografia ampliada para garantir legibilidade.

### 11. [`scripts_js/icons_svg.js`]
* **Descrição**: Central de ícones vetoriais em formato SVG (`ICONS`).
* **O que faz**:
  * Concentra todos os códigos vetoriais da extensão (escudos, cadeados, alertas, buscas, setas e ícones de ameaças).
  * Evita a presença de códigos SVG gigantes soltos nos arquivos HTML e JS.

---

## 📁 Pasta `scripts_python/` (Backend Flask)

### 12. [`scripts_python/app.py`]
* **Descrição**: Servidor Backend REST API desenvolvido em Flask e Python.
* **O que faz**:
  * Roda localmente no endereço `http://127.0.0.1:5000`.
  * Habilita CORS para receber requisições HTTP POST vindas da extensão de navegador.
  * Expõe as rotas `/api/verify` e `/api/verificar`.
  * Recebe o domínio sanitizado e realiza análises no lado do servidor, retornando respostas estruturadas em JSON com status (`perigo` / `seguro`), alvo detectado, nível de confiança e mensagens explicativas.

---

## 📁 Pasta `tests/` (Testes Automatizados)

### 13. [`tests/url_preprocessor.test.js`]
* **Descrição**: Suíte de testes unitários automatizados construída no rodador nativo do Node.js (`node --test`).
* **O que faz**:
  * Valida a sanitização de URLs com e sem protocolo.
  * Testa o reconhecimento de domínios seguros e sufixos institucionais brasileiros (`.ufop.br`, `.gov.br`).
  * Testa a detecção de códigos Punycode e homóglifos cirílicos, gregos e armênios.
  * Valida a identificação de portas não padrão (`http://localhost:444`).
  * Garante que o código `xn--` seja ocultado do `dominioExibicao`.
  * Testa o mapeamento correto dos dicionários didáticos e a retrocompatibilidade da API.


