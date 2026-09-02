# 🏠 IMOVELI - Diagnóstico Inteligente de Imóveis com IA

Plataforma revolucionária que usa Claude Vision API para diagnosticar problemas de imóveis através de fotos.

---

## 🚀 INÍCIO RÁPIDO

### Opção 1: Frontend APENAS (Sem Backend)

1. Abra o arquivo: `frontend/index.html` no navegador
2. Login com qualquer email/senha
3. Use com dados simulados (sem análise de IA)

```
Arquivo: /frontend/index.html
Abrir no navegador: Abra o arquivo localmente
```

---

### Opção 2: COMPLETO (Frontend + Backend com IA)

#### Pré-requisitos
- Node.js v16+ instalado
- Claude API Key (sk-ant-v1-...)
- npm

#### Passo 1: Setup do Backend

```bash
cd backend
npm install
```

#### Passo 2: Criar .env

Crie arquivo `.env` baseado em `.env.example`:

```
ANTHROPIC_API_KEY=seu_sk_ant_aqui
PORT=3001
NODE_ENV=development
```

**IMPORTANTE:** Substitua `seu_sk_ant_aqui` com sua chave real da Anthropic.

#### Passo 3: Iniciar Backend

```bash
npm start
```

Você deve ver:
```
✅ IMOVELI Backend rodando em http://localhost:3001
📡 Claude Vision API: Conectada
🏗️  Endpoints prontos para uso
```

#### Passo 4: Abrir Frontend

Abra em seu navegador:
```
file:///caminho/para/imoveli-completo/frontend/index.html
```

OU use um servidor web local (recomendado):

```bash
# Instale Python (se não tiver)
python -m http.server 8000 --directory frontend

# Acesse no navegador
http://localhost:8000
```

---

## 📱 FUNCIONALIDADES

### ✅ Implementado

- 🔐 Autenticação Email/Senha (localStorage)
- 📊 Dashboard com estatísticas
- 🔍 Diagnóstico com foto (Claude Vision)
- 💰 Análise de custos
- 🔧 Manutenção preventiva
- 👥 Rede de profissionais (4 iniciais)
- 📋 Histórico de diagnósticos
- 🌐 Grafo de confiança
- ⚡ 8 Ações disruptivas

### 🔄 Backend Endpoints

```
POST   /api/diagnose              → Analyzes image with Claude Vision
GET    /api/professionals         → List all professionals
GET    /api/professionals/:id     → Get professional details
POST   /api/users/register        → Create new user
POST   /api/users/login           → Login user
POST   /api/diagnoses             → Save diagnosis
GET    /api/diagnoses/:userId     → Get user diagnoses
GET    /api/health                → Check backend status
```

---

## 🔧 TECNOLOGIA STACK

### Frontend
- HTML5 + CSS3 (CSS Variables)
- JavaScript Vanilla
- localStorage para persistência
- Design responsivo

### Backend
- Node.js
- Express.js
- @anthropic-ai/sdk (Claude Vision)
- Multer (file upload)
- CORS

### IA
- Claude 3.5 Sonnet (Vision)
- Análise em tempo real de imagens

---

## 💡 COMO FUNCIONA

### Fluxo de Diagnóstico

```
1. Usuário faz login
2. Clica em "Novo Diagnóstico"
3. Seleciona foto do problema
4. Frontend envia para Backend
5. Backend converte para base64
6. Backend chama Claude Vision API
7. Claude analisa e retorna JSON estruturado
8. Frontend exibe resultado formatado
9. Diagnóstico salvo em localStorage
```

### Resposta do Claude Vision

```json
{
  "problem_detected": true,
  "problem_category": "Estrutural",
  "problem_type": "Rachaduras na parede",
  "risk_level": "Vermelho",
  "urgency": "Alta",
  "estimated_cost_range": {
    "min": 1000,
    "max": 3000,
    "currency": "BRL"
  },
  "recommended_specialists": [
    {
      "specialty": "Engenheiro Estrutural",
      "description": "Avaliação profissional recomendada"
    }
  ],
  "confidence_score": 92
}
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Erro ao conectar com servidor"

**Problema:** Backend não está rodando

**Solução:**
```bash
# Terminal 1: Backend
cd backend
npm install
ANTHROPIC_API_KEY=seu_sk_aqui npm start

# Terminal 2: Frontend
# Abra http://localhost:8000 no navegador
```

---

### Erro: "Invalid API Key"

**Problema:** Claude API Key está incorreta

**Solução:**
1. Acesse https://console.anthropic.com
2. Copie a chave correta (começa com `sk-ant-v1-`)
3. Atualize no `.env`
4. Reinicie o backend

---

### Frontend não conecta com Backend

**Problema:** CORS bloqueado ou porta errada

**Solução:**
- Certifique-se que backend está em http://localhost:3001
- Frontend deve estar em http://localhost:8000 ou file://
- Verifique se CORS está habilitado (já está no código)

---

## 📦 DEPLOYMENT

### Deploy Backend (Vercel/Heroku)

```bash
# Vercel
vercel deploy

# Heroku
heroku create imoveli-backend
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)

```bash
# Vercel
vercel deploy --prod

# Netlify
netlify deploy --prod
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

```
ANTHROPIC_API_KEY    = Sua chave Claude API
PORT                 = 3001 (padrão)
NODE_ENV             = development/production
DATABASE_URL         = (futuro - Firebase/PostgreSQL)
```

---

## 📊 ROADMAP

### MVP 1.0 ✅
- [x] Diagnóstico com IA
- [x] 3 categorias de problemas
- [x] Rede de profissionais básica

### MVP 1.5 (Próximo)
- [ ] Firebase integration
- [ ] Sistema de pagamento
- [ ] Garantia 100%
- [ ] 5 categorias de problemas

### MVP 2.0
- [ ] Leilão reverso
- [ ] Tokens de confiança
- [ ] Diagnóstico colaborativo
- [ ] 11 categorias de problemas

---

## 👤 Sobre

**Criador:** Allan Porto (@allanporto_arquitetura)

**Visão:** "IA que conhece seu imóvel, ajuda a tomar melhores decisões e encontra profissionais confiáveis"

**Modelo:** Comissão 15% em serviços, margem 10% em seguro

---

## 📄 Licença

MIT - Livre para usar e modificar

---

## 📞 Suporte

Para problemas, envie mensagem para: `contato@imoveli.com.br`

---

**Made with ❤️ by Allan Porto | Powered by Claude AI**
