# Auditoria de Cenas Imersivas

## Achados consolidados

1. A cena de praia possui os defeitos visíveis relatados: o hotspot **Ocean** estava no céu, os marcadores de **Palm Tree**, **Sand** e **Shell** não estavam ancorados nos objetos correspondentes e **Wave** duplicava semanticamente o oceano.
2. Diversas cenas mantêm conteúdo e professor corretos, mas com metadados de idioma incompatíveis. Os casos identificados incluem hotel, park, mountain, farm, museum, gym, library, office, metro, port e medieval.
3. A cena de restaurante possui identificadores internos em italiano, embora o conteúdo seja em português. Esses identificadores devem ser padronizados para impedir associações indiretas incorretas.
4. A cena de deserto contém uma estrela incompatível com a imagem diurna; a cena de spa usa ícone de praia para toalha.
5. Cada hotspot deverá falar exclusivamente no idioma-alvo de sua cena. A tradução em português permanecerá visual, como apoio, e não será usada como fala do objeto.

## Próxima ação

Substituir coordenadas livres por um registro de hotspot validado por cena, com vínculo explícito entre objeto visual, rótulo, ícone, idioma-alvo e ação de fala.

## Validação visual em andamento

- **Praia Tropical:** a grade artificial foi removida. Palmeira, oceano, onda e areia agora aparecem sobre os elementos visíveis correspondentes.
- **Paris:** a rota de validação por cena abre corretamente a imagem de Paris e os oito hotspots esperados. A revisão visual segue para as demais cenas usando esse mesmo acesso direto.
- **Floresta Encantada:** os seis hotspots aparecem no cenário apropriado: árvore, cogumelo, pássaro, flor, rio e sol. Um carregamento transitório exibiu a página de erro, mas a repetição abriu a cena normalmente; o comportamento será acompanhado na validação final.
- **Tóquio:** o retrato passou a usar Yuki, compatível com a cena japonesa. Foram identificados hotspots que precisam ser restringidos a elementos claramente visíveis do cenário urbano.
- **Nova York:** a imagem mostra a Estátua da Liberdade, prédios, torre, rio e pôr do sol. Os hotspots de ponte, parque, táxi, cachorro-quente e metrô não correspondem a objetos visíveis e serão substituídos por vocabulário presente na imagem.
- **Nova York após correção:** os seis hotspots agora correspondem à estátua, torre, horizonte urbano, rio, pôr do sol e prédio visíveis no cenário.
- **Cozinha:** geladeira, forno, mesa e janela estão visíveis. O ponto de faca e o de prato não correspondem claramente a objetos visíveis e serão substituídos por itens da bancada e dos utensílios presentes na imagem.
- **Restaurante:** as correções ancoraram a massa, o vinho, a mesa, a vela, o quadro e a janela nos elementos visíveis do ambiente.
- **Aeroporto:** portão e quadro de partidas estão visíveis. Bagagem, passaporte, avião e segurança não possuem objeto individual identificável nesta fotografia e serão substituídos por pessoas, corredor móvel, janela e sinalização presentes no cenário.
- **Hotel:** o retrato de Giulia e o idioma italiano estão corretos. Chave, elevador, piscina, quarto e restaurante não são visíveis no lobby e foram trocados por lustre, coluna, poltrona, planta e luminária.
- **Parque:** árvore e fonte correspondem à imagem. Banco, flor, caminho e pássaro exigem ajuste para os elementos de banco, pessoas, cachorro e gramado realmente visíveis.
- **Montanha:** cume, neve, floresta, rocha e nuvem são compatíveis com a imagem. A águia não está visível e será substituída pelo lago; o ponto do cume será aproximado do topo da montanha.
- **Deserto:** areia, sol e duna estão presentes. O grupo de camelos está claramente visível à direita; o antigo ponto de camelo e o de oásis serão ajustados para a caravana e as pegadas visíveis, sem reintroduzir objeto inexistente.
- **Fazenda:** os seis hotspots correspondem à vaca, celeiro, feno, trator, galinha e céu visíveis na imagem; a professora Maja e o polonês estão coerentes.
- **Museu:** quadro, escultura, moldura, visitante, galeria e luz correspondem aos objetos do corredor; Giulia e o italiano estão coerentes.
