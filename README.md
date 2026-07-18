# 🌍 MultiLingue Universal - Plataforma de Ensino com IA Avançada

> A plataforma mais avançada do mundo para aprendizado de idiomas com IA, voz natural ultra-realista e análise de pronúncia em tempo real.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with Manus](https://img.shields.io/badge/Made%20with-Manus-purple)](https://manus.im)

## 🚀 Sobre o Projeto

MultiLingue Universal é uma plataforma revolucionária de ensino de idiomas que utiliza:

- **🎙️ Voz Natural Ultra-Realista**: Vozes WaveNet de última geração em 57 idiomas
- **🧠 IA Conversacional Avançada**: Conversas naturais com GPT-4 adaptadas ao seu nível
- **📊 Análise de Pronúncia em Tempo Real**: Feedback instantâneo e preciso
- **♾️ Conteúdo Infinito**: IA gera exercícios personalizados continuamente
- **🎯 Personalização Extrema**: Experiência única baseada no comportamento do aluno
- **📱 Funciona Offline**: Continue aprendendo sem internet

## 🌟 Recursos Principais

### 57+ Idiomas Disponíveis
Do Inglês ao Mandarim, do Árabe ao Japonês - todos com voz natural e conteúdo completo.

### 600+ Lições Estruturadas
Conteúdo organizado em 3 níveis (Beginner, Intermediate, Advanced) para cada idioma.

### Sistema de Gamificação
- Pontos XP
- Sequências diárias (streaks)
- Conquistas e badges
- Rankings e desafios

### Planos Flexíveis
- **Gratuito**: 10 lições de demonstração
- **Mensal**: R$ 39,90/mês - 200 lições por idioma
- **Anual**: R$ 449,90/ano - Economia de 25%
- **Vitalício**: R$ 1.399,90 - Acesso por 3,5 anos

## 💙 Compromisso Social

**1% do lucro líquido** é destinado a instituições de caridade e ensino que promovem educação de qualidade.

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- Wouter (routing)
- shadcn/ui (componentes)

### Backend
- Node.js + Express
- tRPC 11 (type-safe API)
- Drizzle ORM
- MySQL/TiDB

### IA & Serviços
- OpenAI GPT-4 (conversação)
- ElevenLabs (voz natural)
- Google Maps API
- PagBank (pagamentos)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/multilingue-universal.git

# Entre na pasta
cd multilingue-universal

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações do banco
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
BUILT_IN_FORGE_API_KEY=...
PAGBANK_API_KEY=...
```

## 📚 Estrutura do Projeto

```
client/
  src/
    pages/          # Páginas da aplicação
    components/     # Componentes reutilizáveis
    lib/            # Configurações (tRPC, etc)
server/
  routers.ts        # Endpoints tRPC
  db.ts             # Queries do banco
drizzle/
  schema.ts         # Schema do banco de dados
```

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Executar testes em modo watch
pnpm test:watch
```

## 🚀 Deploy

O projeto está configurado para deploy automático no Manus:

1. Faça commit das suas alterações
2. Clique em "Publish" no painel Manus
3. Aguarde o deploy (2-3 minutos)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

**Renato Villar** - Criador do MultiLingue Universal

- Website: https://multilingueia-z3xkmfhw.manus.space
- Email: rovillar02@gmail.com

## 🙏 Agradecimentos

- [Manus](https://manus.im) - Plataforma de desenvolvimento
- [OpenAI](https://openai.com) - GPT-4
- [ElevenLabs](https://elevenlabs.io) - Voz natural
- Todos os beta testers e early adopters

---

**Feito com ❤️ e IA avançada**
