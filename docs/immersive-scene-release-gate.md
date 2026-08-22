# Portão de publicação da Cena Imersiva

O build de produção executa, em ordem, a tipagem, a validação headless da rota autenticada, as regressões específicas de fluxo e recuperação da Cena Imersiva e, por fim, toda a suíte. Se qualquer etapa falhar, o bundle não é gerado.

> A validação de navegador usa uma sessão de teste controlada por interceptação local de chamadas tRPC. Ela não utiliza dados de clientes, não cria contas e não contorna a autenticação em produção.

A checagem abre a página pública, segue o link interno para `/immersive-scene`, fornece um usuário de teste com aceite de proteção e acesso de aula aprovados e confirma a renderização da Praia Tropical, do retrato de James e do controle de apresentação. A entrega curricular real, a proteção de visitantes e a recuperação local possuem regressões complementares na suíte principal.
