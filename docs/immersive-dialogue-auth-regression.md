# Evidência da regressão do diálogo imersivo

- **Rota testada:** `/immersive-scene` no servidor de desenvolvimento.
- **Ação:** clicar em **Iniciar Diálogo**.
- **Resultado observado:** redirecionamento imediato para o portal de login Manus (`/app-auth`), antes de abrir o painel de diálogo ou iniciar a fala.
- **Causa confirmada:** a rota pública da cena aciona as mutações protegidas `tts.speak` e `ttsGoogle.generate` sem um estado explícito de sessão; o manipulador global trata a resposta `UNAUTHORIZED` redirecionando para login.
- **Impacto:** nenhuma resposta de áudio chega ao elemento `Audio`; consequentemente `isSpeaking` e os visemas não ativam. Tentativas repetidas acumulam falhas no contador da prévia.

## Critério de correção

O clique deve abrir o painel de diálogo sem gerar `UNAUTHORIZED`. Para visitantes, a interface deve pedir autenticação antes de iniciar recursos de IA. Para uma sessão autenticada, deve manter o fluxo de áudio neural e visemas sem redirecionamento.
