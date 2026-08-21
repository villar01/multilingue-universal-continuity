# Verificação visual da matriz PT-BR→EN — 21 de agosto de 2026

| Lote verificado | Resultado observado |
|---|---|
| Praia Tropical, Floresta Encantada, Nova York, Aeroporto Internacional, Sala de Aula, Cinema Moderno e Casa da Família | As sete cenas renderizaram cenário, hotspots, controles e retrato de **James**. O botão de apresentação e o balão docente também mostraram James. |
| Família no Aeroporto — antes da correção | O cenário não carregava e a cena apresentava fundo preto, embora James e os hotspots permanecessem visíveis. |
| Família no Aeroporto — após a correção | O cenário voltou a renderizar a partir de `/manus-storage/scene_airport_family_005d0f25.jpg`; James, hotspots, Livro SOS e controles continuaram presentes. |
| Paris, Cozinha, Restaurante, Supermercado e Hospital | Os cinco cenários renderizaram com **James** no retrato, botão de apresentação e balão docente. |
| Café Parisiense e Tóquio | As duas cenas renderizaram com **Ingrid**, inclusive no retrato, botão de apresentação e balão docente. O Café exibiu corretamente a ativação de acesso protegido. |
| Montanha, Parque, Museu, Porto, Mercado Medieval e Spa | A verificação paralela encontrou respostas de sobrecarga ou a fronteira de recuperação local. Esses resultados não foram considerados aprovação individual. |
| Montanha — abertura isolada | A cena voltou a renderizar normalmente, com cenário e Ingrid visíveis; a falha não se repetiu fora do lote paralelo. A próxima validação deve continuar por abertura individual, que representa o clique manual do aluno. |
| Parque — abertura isolada | A cena renderizou normalmente, com cenário, hotspots, controles e **Ingrid** no botão de apresentação, balão docente e retrato. |

Esta verificação cobre apenas a renderização visual de prévia. O material pedagógico continua protegido pelo fluxo autenticado e as regras de voz, retrato e clipes são cobertas pela suíte de regressão.
