"""
Backend Flask - PhishGuard
Servidor de análise avançada de URLs e domínios suspeitos.
"""

from flask import Flask, request, jsonify

from flask_cors import CORS

app = Flask(__name__)

# Habilita CORS para permitir que a extensão de navegador faça requisições HTTP
CORS(app)

def analisar_dominio_backend(dominio: str, url_completa: str):
    """
    Realiza a análise heurística do domínio no servidor backend.
    """
    dominio_normalizado = (dominio or "").lower().trim() if hasattr(dominio, "trim") else (dominio or "").lower().strip()

    # Identificação de anomalias mockadas (Punycode ou tamanho excessivo de domínio)
    eh_punycode = "xn--" in dominio_normalizado
    eh_longo = len(dominio_normalizado) > 25

    if eh_punycode:
        alvo_detectado = "Mercado Livre" if "mrcadolivre" in dominio_normalizado or "mercadolivre" in dominio_normalizado else "Instituição Financeira / Serviço"
        return {
            "status": "perigo",
            "alvo": alvo_detectado,
            "confianca": "95%",
            "mensagem": f"Este site possui código Punycode e está tentando se passar por {alvo_detectado}!",
            "motivo": "Ataque Homográfico via Punycode detectado",
            "dominio": dominio_normalizado
        }
    elif eh_longo:
        return {
            "status": "perigo",
            "alvo": "Serviço Web",
            "confianca": "80%",
            "mensagem": "Domínio excessivamente longo com características típicas de phishing.",
            "motivo": "Comprimento de domínio anômalo",
            "dominio": dominio_normalizado
        }
    else:
        return {
            "status": "seguro",
            "alvo": None,
            "confianca": "100%",
            "mensagem": "URL analisada e considerada segura pelo servidor.",
            "motivo": "Nenhuma anomalia detectada pelo servidor backend",
            "dominio": dominio_normalizado
        }


@app.route('/api/verify', methods=['POST'])
@app.route('/api/verificar', methods=['POST'])
def verificar_url():
    """
    Endpoint HTTP POST para receber o domínio sanitizado e a URL para análise.
    """
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "Nenhum dado fornecido no corpo da requisição"}), 400

    dominio = dados.get('domain') or dados.get('dominio', '')
    url_completa = dados.get('full_url') or dados.get('url_completa', '')

    print(f"[PhishGuard Backend] Processando análise para o domínio: {dominio}")
    print(f"[PhishGuard Backend] URL Completa: {url_completa}")

    resultado = analisar_dominio_backend(dominio, url_completa)

    print(f"[PhishGuard Backend] Resposta gerada: status={resultado['status']} | motivo={resultado['motivo']}")

    return jsonify(resultado), 200


if __name__ == '__main__':
    print("===================================================")
    print("Iniciando Servidor Backend PhishGuard na porta 5000...")
    print("===================================================")
    app.run(host='127.0.0.1', port=5000, debug=True)
