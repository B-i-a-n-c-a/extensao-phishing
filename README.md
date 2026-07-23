**

Título: PhishGuard: Extensão de Navegador para Detecção de Phishing via Análise Heurística de URL com Backend em Python/Flask

#### 1. Introdução e Contextualização
O cenário atual de ameaças cibernéticas tem evidenciado um aumento significativo nos ataques de Phishing, nos quais usuários são induzidos a fornecer dados sensíveis em páginas fraudulentas que mimetizam visualmente sites legítimos. Estudos de mercado indicam que, apesar das soluções tradicionais de segurança, a engenharia social continua sendo uma das principais portas de entrada para violações de dados.
Observa-se que muitos golpes utilizam técnicas específicas para burlar a atenção visual do usuário. A primeira técnica é a ofuscação por extensão, onde URLs extremamente longas e complexas são utilizadas para esconder o domínio real. A segunda, mais sofisticada, é o Ataque Homógrafo (ou IDN homograph attack), que explora características do padrão Unicode. Neste ataque, caracteres de alfabetos como o Cirílico (utilizado em russo e outras línguas eslavas) são substituídos por letras visualmente idênticas às do alfabeto Latino. Por exemplo, o domínio "www.mercadolivre.com.br" pode ser falsificado como "www.mеrcadolivre.com.br", onde a letra "e" é na verdade um caracter cirílico, tornando a URL visualmente indistinguível para o usuário desatento.

#### 2. Objetivo
Desenvolver uma extensão para navegadores web (Chrome/Firefox) integrada a um backend em Python/Flask, que atue como uma camada adicional de segurança. A ferramenta permitirá que o usuário insira ou clique em um link, e a extensão enviará essa URL para o servidor Flask, onde scripts especializados realizarão a verificação heurística com foco em:
1. Extensão da URL: Identificar links que utilizam cadeias de caracteres excessivamente longas como técnica de ofuscação.
2. Homoglifia (Unicode): Detectar a presença de caracteres de alfabetos estrangeiros (como Cirílico, Grego ou Armênio) em domínios que deveriam ser compostos apenas por caracteres Latinos, alertando sobre possíveis tentativas de typosquatting internacionalizado.
3. Fundamentação Teórica e Tecnologias Utilizadas
	A solução adotará uma arquitetura cliente-servidor, onde a extensão (cliente) será responsável pela interface e coleta da URL, e o backend (servidor) executará a lógica pesada de análise, garantindo maior desempenho, segurança e facilidade de atualização dos algoritmos de detecção. As tecnologias propostas são:
	-  Plataforma da Extensão (Cliente): Extensão de Navegador (Manifest V3 para Chrome e compatível com Firefox).	
	- Front-end da Extensão: HTML5, CSS3 e JavaScript (ES6+) para interface de usuário (popup de inserção de link, exibição de alertas e comunicação assíncrona com o backend via Fetch API / AJAX).
	
**Backend (Servidor):**
-  Linguagem: Python 3
-  Framework: Flask (para criação das rotas da API RESTful que receberão as URLs via requisições POST/GET).
**Módulos de Análise (scripts Python):**
- Módulo de Comprimento: Análise do tamanho da string da URL. URLs que excedem um threshold definido (ex: mais de 150 caracteres) serão marcadas como suspeitas.
- Módulo Homógrafo (Unicode): Conversão do domínio para o formato Punycode utilizando a biblioteca idna do Python. Se o domínio original contém caracteres não-ASCII e sua representação Punycode inicia com "xn--", o sistema verificará se o domínio está tentando se passar por um domínio conhecido listado em uma whitelist local (ex: bancos, redes sociais, marketplaces).
#### 4. Método e Desenvolvimento
A metodologia de desenvolvimento será dividida nas seguintes etapas:
**1. Configuração do Backend (Flask):**
    - Criação de um servidor Flask local (ou remoto) com rotas específicas, por exemplo: /api/verify.
    - Desenvolvimento dos scripts Python para as funções de análise (url_length_check(), homograph_detection()).
    - Configuração de CORS (Cross-Origin Resource Sharing) para permitir que a extensão se comunique com o servidor.

**2. Configuração da Extensão (Cliente JavaScript):**
    - Criação do manifesto da extensão e permissões necessárias (activeTab, storage, host_permissions para o endereço do servidor Flask).
    - Implementação do popup em HTML/JS que captura o link inserido pelo usuário e envia uma requisição fetch() para o endpoint do Flask contendo a URL.

**3. Implementação da Comunicação Cliente-Servidor:**
    - A extensão envia um JSON {"url": "https://exemplo.com"} para o Flask.
    - O Flask processa a URL com os scripts Python e retorna um JSON {"status": "perigo", "motivo": "Homoglyph attack detectado - uso de caracteres cirílicos"}.
    
**4. Construção da Whitelist Heurística:**
Criação de um banco de dados local (em um arquivo JSON ou SQLite) dentro do backend, com os domínios mais visados (Google, Facebook, Mercado Livre, etc.) para comparação de fuzzy matching.

**5. Interface de Usuário (UI):**
Desenvolvimento do popup da extensão que exibe o veredito retornado pelo servidor ("Seguro", "Suspeito - Link muito longo" ou "Perigo - Possível Ataque Homógrafo").

**6. Testes e Validação:** 
Coleta de URLs maliciosas reais (provenientes de repositórios como OpenPhish) e URLs legítimas para calcular a Taxa de Acerto (True Positive) e Falso Positivo. Testes de latência da comunicação entre extensão e backend.
#### 5. Resultados Esperados
Espera-se obter como resultado um protótipo funcional composto por:
1. Backend em Python/Flask rodando localmente (ou em um servidor de testes), com scripts de análise prontos para identificar URLs suspeitas por comprimento excessivo ou caracteres homógrafos.
2. Extensão de Navegador que se comunica com esse backend via requisições HTTP, permitindo que o usuário cole um link e receba um diagnóstico imediato.
3. Alta Precisão: Alcançar um índice de acerto superior a 85% na identificação de URLs maliciosas baseadas nessas duas heurísticas específicas, complementando as defesas já existentes no navegador.
4. Arquitetura Escalável: Demonstrar que a separação entre front-end (extensão) e back-end (Python/Flask) permite futuras melhorias nos algoritmos de detecção sem necessidade de atualizar a extensão no navegador do usuário.
#### 6 Considerações finais
A extensão proposta visa preencher uma lacuna de segurança focada na percepção visual do usuário. Enquanto antivírus baseados em blocklist falham contra novos domínios (zero-day), a análise heurística de caracteres cirílicos e o estranhamento gerado por URLs excessivamente longas são indicadores fortes de fraude. A utilização de Python com Flask no backend permite que a lógica de detecção seja mais robusta e fácil de implementar do que se estivesse toda escrita em JavaScript puro, além de facilitar a integração com futuras bases de dados ou APIs externas de reputação de domínios. O projeto buscará demonstrar que é possível uma camada de defesa leve, eficaz e centrada no comportamento do link e não apenas na reputação do domínio.

#### Referências

[TypoProtect. Advanced protection against phishing, typosquatting and homograph attacks. Firefox Add-ons.](https://addons.mozilla.org/en-US/firefox/addon/typoprotect/)
[GitHub. Phishing URL Detector: A Project done in course completion iit ropar.](https://github.com/Prince-rj/Phishing_URL_Detector%3E)
[Flask Documentation. Flask Web Framework.](https://flask.palletsprojects.com/)