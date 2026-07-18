# 🚀 Setup - MultiLingue Universal

## 📊 Configurar Google Analytics 4

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Crie uma propriedade GA4
3. Copie o ID de medição (formato: `G-XXXXXXXXXX`)
4. Substitua em `client/index.html` linha 11:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=SEU_ID_AQUI"></script>
   ```
5. Substitua também na linha 16:
   ```javascript
   gtag('config', 'SEU_ID_AQUI');
   ```

## 📱 Configurar Facebook Pixel

1. Acesse [Facebook Business Manager](https://business.facebook.com/)
2. Vá em Eventos > Pixels
3. Copie o Pixel ID (número de 15 dígitos)
4. Substitua em `client/index.html` linha 29:
   ```javascript
   fbq('init', 'SEU_PIXEL_ID');
   ```
5. Substitua também na linha 33:
   ```html
   src="https://www.facebook.com/tr?id=SEU_PIXEL_ID&ev=PageView&noscript=1"
   ```

## 🎯 Testar Landing Page

1. Acesse: `https://seu-dominio.com/prelaunch`
2. Cadastre um email de teste
3. Verifique se aparece mensagem de sucesso
4. Confirme no banco de dados (tabela `waitlist`)

## 💳 Configurar PagBank

Já configurado automaticamente via variáveis de ambiente:
- `PAGBANK_API_KEY`
- `PAGBANK_BASE_URL`

## 🔐 Segurança

Sistema já inclui:
- ✅ Rate limiting (100 req/min)
- ✅ Detecção de bots
- ✅ Proteção CORS
- ✅ Watermark em vídeos

## 📈 Monitoramento

Eventos rastreados automaticamente:
- PageView (todas as páginas)
- Conversões de email (waitlist)
- Cliques em CTAs
- Início de lições

## 🌍 Idiomas Disponíveis

54 idiomas populados:
- Europeus: Inglês, Espanhol, Francês, Alemão, Italiano, Português, etc.
- Asiáticos: Chinês, Japonês, Coreano, Hindi, Árabe, etc.
- Outros: Russo, Turco, Hebraico, Swahili, etc.

Total: **1134 lições** distribuídas em 162 cursos (3 níveis por idioma)

## 💰 Preços Configurados

**Lançamento (60% OFF):**
- Mensal: $3,96 (normal $9,90)
- Anual: $35,60 (normal $89,00)
- Bianual: $59,60 (normal $149,00)

**Após primeiros 100 clientes (50% OFF):**
- Mensal: $9,90 (normal $19,90)
- Anual: $89,00 (normal $179,00)
- Bianual: $149,00 (normal $299,00)

## 🎬 Próximas Funcionalidades

Estrutura já criada para:
- Vídeos interativos (Cine Learning)
- Análise de pronúncia avançada
- Conversação ilimitada com IA GPT-4

## 📞 Suporte

Para dúvidas técnicas, consulte:
- README.md (documentação técnica)
- todo.md (tarefas e progresso)
