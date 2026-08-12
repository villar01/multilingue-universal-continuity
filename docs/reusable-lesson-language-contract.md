# Contrato de lição reutilizável por idioma

Cada lição usa a mesma estrutura visual e pedagógica, mas recebe um **contexto linguístico explícito**. O contexto possui três papéis: o idioma nativo do aluno, usado para explicações; o idioma estudado, dono do conteúdo e dos exercícios; e a variante de voz do professor, que obrigatoriamente pertence à mesma família linguística do idioma estudado.

| Elemento | Pode mudar por aluno | Regra obrigatória |
|---|---:|---|
| Idioma nativo | Sim | Exibe explicações e traduções de apoio. |
| Idioma estudado | Sim | Define conteúdo, vocabulário, exercício, texto e resposta falada. |
| Professor | Sim, entre compatíveis | A variante de voz deve pertencer ao idioma estudado. |
| Variante regional | Sim, por escolha explícita | É exibida no perfil e não pode ser substituída automaticamente por outro idioma. |

Essa arquitetura permite reutilizar uma única tela para todos os idiomas, sem criar uma versão da mesma aula para cada par de idiomas. Também impede que a troca de professor introduza uma língua ou voz fora do contexto da aula.
