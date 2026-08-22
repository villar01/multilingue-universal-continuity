# Portão de publicação da Cena Imersiva

O build de produção executa, em ordem, a tipagem, o contrato autenticado portátil, as regressões específicas de fluxo e recuperação da Cena Imersiva e, por fim, toda a suíte. Se qualquer etapa falhar, o bundle não é gerado.

> A validação de navegador usa uma sessão de teste controlada por interceptação local de chamadas tRPC. Ela não utiliza dados de clientes, não cria contas e não contorna a autenticação em produção.

A checagem de navegador `validate:immersive-scene-authenticated-browser` abre a página pública, segue o link interno para `/immersive-scene`, fornece um usuário de teste com aceite de proteção e acesso de aula aprovados e confirma a renderização da Praia Tropical, do retrato de James e do controle de apresentação. Ela é executada no ambiente de validação que possui navegador; o container de publicação não instala um navegador. O build de produção exige o contrato autenticado equivalente e as regressões de entrega, proteção de visitantes e recuperação local.
