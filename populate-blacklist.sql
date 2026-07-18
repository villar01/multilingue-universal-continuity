-- POPULAR BLACKLIST INICIAL COM 500+ PALAVRAS
-- Categorizado por severidade e contexto cultural/religioso

-- PALAVRAS CRÍTICAS (UNIVERSAL - TODAS IDADES)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'child porn', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Conteúdo ilegal extremamente grave', 'critical', true, 1),
('blacklist', 'word', 'pornografia infantil', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Conteúdo ilegal extremamente grave', 'critical', true, 1),
('blacklist', 'word', 'pedophilia', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Conteúdo ilegal extremamente grave', 'critical', true, 1),
('blacklist', 'word', 'pedofilia', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Conteúdo ilegal extremamente grave', 'critical', true, 1),
('blacklist', 'word', 'terrorism', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Conteúdo ilegal extremamente grave', 'critical', true, 1),
('blacklist', 'word', 'terrorismo', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Conteúdo ilegal extremamente grave', 'critical', true, 1),
('blacklist', 'word', 'suicide', false, '["infantil"]', NULL, NULL, 'Tema sensível para crianças', 'critical', true, 1),
('blacklist', 'word', 'suicídio', false, '["infantil"]', NULL, NULL, 'Tema sensível para crianças', 'critical', true, 1),
('blacklist', 'word', 'self-harm', false, '["infantil"]', NULL, NULL, 'Tema sensível para crianças', 'critical', true, 1),
('blacklist', 'word', 'automutilação', false, '["infantil"]', NULL, NULL, 'Tema sensível para crianças', 'critical', true, 1);

-- VIOLÊNCIA (INFANTIL/ADOLESCENTE)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'kill', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'matar', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'murder', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'assassinar', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'blood', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'sangue', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'weapon', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'arma', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'gun', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'pistola', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'knife', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'faca', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'bomb', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'bomba', false, '["infantil"]', NULL, NULL, 'Violência explícita', 'high', true, 1),
('blacklist', 'word', 'torture', false, '["infantil","adolescente"]', NULL, NULL, 'Violência extrema', 'critical', true, 1),
('blacklist', 'word', 'tortura', false, '["infantil","adolescente"]', NULL, NULL, 'Violência extrema', 'critical', true, 1),
('blacklist', 'word', 'rape', false, '["infantil","adolescente"]', NULL, NULL, 'Violência sexual', 'critical', true, 1),
('blacklist', 'word', 'estupro', false, '["infantil","adolescente"]', NULL, NULL, 'Violência sexual', 'critical', true, 1);

-- CONTEÚDO SEXUAL (INFANTIL/ADOLESCENTE)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'sex', false, '["infantil"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'sexo', false, '["infantil"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'porn', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto explícito', 'critical', true, 1),
('blacklist', 'word', 'pornografia', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto explícito', 'critical', true, 1),
('blacklist', 'word', 'nude', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'nu', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'naked', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'nua', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'breast', false, '["infantil"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'seio', false, '["infantil"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'penis', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto explícito', 'high', true, 1),
('blacklist', 'word', 'pênis', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto explícito', 'high', true, 1),
('blacklist', 'word', 'vagina', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto explícito', 'high', true, 1),
('blacklist', 'word', 'prostitute', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1),
('blacklist', 'word', 'prostituta', false, '["infantil","adolescente"]', NULL, NULL, 'Conteúdo adulto', 'high', true, 1);

-- PALAVRÕES (INFANTIL)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'fuck', false, '["infantil"]', NULL, NULL, 'Palavrão', 'high', true, 1),
('blacklist', 'word', 'shit', false, '["infantil"]', NULL, NULL, 'Palavrão', 'high', true, 1),
('blacklist', 'word', 'damn', false, '["infantil"]', NULL, NULL, 'Palavrão', 'medium', true, 1),
('blacklist', 'word', 'hell', false, '["infantil"]', NULL, NULL, 'Palavrão', 'medium', true, 1),
('blacklist', 'word', 'ass', false, '["infantil"]', NULL, NULL, 'Palavrão', 'medium', true, 1),
('blacklist', 'word', 'bitch', false, '["infantil"]', NULL, NULL, 'Palavrão ofensivo', 'high', true, 1),
('blacklist', 'word', 'porra', false, '["infantil"]', NULL, NULL, 'Palavrão', 'high', true, 1),
('blacklist', 'word', 'merda', false, '["infantil"]', NULL, NULL, 'Palavrão', 'high', true, 1),
('blacklist', 'word', 'caralho', false, '["infantil"]', NULL, NULL, 'Palavrão', 'high', true, 1),
('blacklist', 'word', 'puta', false, '["infantil"]', NULL, NULL, 'Palavrão ofensivo', 'high', true, 1),
('blacklist', 'word', 'cu', false, '["infantil"]', NULL, NULL, 'Palavrão', 'medium', true, 1),
('blacklist', 'word', 'bosta', false, '["infantil"]', NULL, NULL, 'Palavrão', 'medium', true, 1),
('blacklist', 'word', 'cacete', false, '["infantil"]', NULL, NULL, 'Palavrão', 'medium', true, 1),
('blacklist', 'word', 'pica', false, '["infantil"]', NULL, NULL, 'Palavrão vulgar', 'high', true, 1),
('blacklist', 'word', 'buceta', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão vulgar', 'high', true, 1);

-- PALAVRÕES PESADOS (INFANTIL/ADOLESCENTE)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'motherfucker', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão extremamente ofensivo', 'critical', true, 1),
('blacklist', 'word', 'filho da puta', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão extremamente ofensivo', 'critical', true, 1),
('blacklist', 'word', 'cunt', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão extremamente ofensivo', 'critical', true, 1),
('blacklist', 'word', 'whore', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão ofensivo', 'high', true, 1),
('blacklist', 'word', 'puta que pariu', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão extremamente ofensivo', 'critical', true, 1),
('blacklist', 'word', 'vai tomar no cu', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão extremamente ofensivo', 'critical', true, 1),
('blacklist', 'word', 'vai se foder', false, '["infantil","adolescente"]', NULL, NULL, 'Palavrão extremamente ofensivo', 'critical', true, 1);

-- DROGAS E ÁLCOOL (INFANTIL)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'drug', false, '["infantil"]', NULL, NULL, 'Substâncias ilegais', 'high', true, 1),
('blacklist', 'word', 'droga', false, '["infantil"]', NULL, NULL, 'Substâncias ilegais', 'high', true, 1),
('blacklist', 'word', 'cocaine', false, '["infantil","adolescente"]', NULL, NULL, 'Droga pesada', 'critical', true, 1),
('blacklist', 'word', 'cocaína', false, '["infantil","adolescente"]', NULL, NULL, 'Droga pesada', 'critical', true, 1),
('blacklist', 'word', 'heroin', false, '["infantil","adolescente"]', NULL, NULL, 'Droga pesada', 'critical', true, 1),
('blacklist', 'word', 'heroína', false, '["infantil","adolescente"]', NULL, NULL, 'Droga pesada', 'critical', true, 1),
('blacklist', 'word', 'meth', false, '["infantil","adolescente"]', NULL, NULL, 'Droga pesada', 'critical', true, 1),
('blacklist', 'word', 'metanfetamina', false, '["infantil","adolescente"]', NULL, NULL, 'Droga pesada', 'critical', true, 1),
('blacklist', 'word', 'marijuana', false, '["infantil"]', NULL, NULL, 'Droga', 'high', true, 1),
('blacklist', 'word', 'maconha', false, '["infantil"]', NULL, NULL, 'Droga', 'high', true, 1),
('blacklist', 'word', 'weed', false, '["infantil"]', NULL, NULL, 'Droga', 'high', true, 1),
('blacklist', 'word', 'alcohol', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'álcool', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'beer', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'cerveja', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'wine', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'vinho', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'vodka', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1),
('blacklist', 'word', 'whisky', false, '["infantil"]', NULL, NULL, 'Bebida alcoólica', 'medium', true, 1);

-- DISCURSO DE ÓDIO (UNIVERSAL)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'nigger', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Discurso de ódio racial', 'critical', true, 1),
('blacklist', 'word', 'faggot', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Discurso de ódio homofóbico', 'critical', true, 1),
('blacklist', 'word', 'retard', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Discurso de ódio capacitista', 'critical', true, 1),
('blacklist', 'word', 'retardado', false, '["infantil","adolescente","adulto"]', NULL, NULL, 'Discurso de ódio capacitista', 'critical', true, 1),
('blacklist', 'word', 'nazi', false, '["infantil","adolescente"]', NULL, NULL, 'Discurso de ódio', 'high', true, 1),
('blacklist', 'word', 'nazista', false, '["infantil","adolescente"]', NULL, NULL, 'Discurso de ódio', 'high', true, 1),
('blacklist', 'word', 'racist', false, '["infantil"]', NULL, NULL, 'Discurso de ódio', 'high', true, 1),
('blacklist', 'word', 'racista', false, '["infantil"]', NULL, NULL, 'Discurso de ódio', 'high', true, 1);

-- SENSIBILIDADE RELIGIOSA - MUSLIM
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'pork', false, NULL, NULL, '["muslim"]', 'Alimento proibido no Islã', 'medium', true, 1),
('blacklist', 'word', 'porco', false, NULL, NULL, '["muslim"]', 'Alimento proibido no Islã', 'medium', true, 1),
('blacklist', 'word', 'bacon', false, NULL, NULL, '["muslim"]', 'Alimento proibido no Islã', 'medium', true, 1),
('blacklist', 'word', 'gambling', false, NULL, NULL, '["muslim"]', 'Proibido no Islã', 'medium', true, 1),
('blacklist', 'word', 'jogo de azar', false, NULL, NULL, '["muslim"]', 'Proibido no Islã', 'medium', true, 1),
('blacklist', 'word', 'casino', false, NULL, NULL, '["muslim"]', 'Proibido no Islã', 'medium', true, 1);

-- SENSIBILIDADE RELIGIOSA - JEWISH
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'shellfish', false, NULL, NULL, '["jewish"]', 'Alimento não-kosher', 'medium', true, 1),
('blacklist', 'word', 'frutos do mar', false, NULL, NULL, '["jewish"]', 'Alimento não-kosher', 'medium', true, 1),
('blacklist', 'word', 'shrimp', false, NULL, NULL, '["jewish"]', 'Alimento não-kosher', 'medium', true, 1),
('blacklist', 'word', 'camarão', false, NULL, NULL, '["jewish"]', 'Alimento não-kosher', 'medium', true, 1);

-- SENSIBILIDADE RELIGIOSA - HINDU
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'beef', false, NULL, NULL, '["hindu"]', 'Vaca é sagrada no hinduísmo', 'high', true, 1),
('blacklist', 'word', 'carne de vaca', false, NULL, NULL, '["hindu"]', 'Vaca é sagrada no hinduísmo', 'high', true, 1),
('blacklist', 'word', 'cow meat', false, NULL, NULL, '["hindu"]', 'Vaca é sagrada no hinduísmo', 'high', true, 1);

-- SENSIBILIDADE RELIGIOSA - BUDDHIST
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'killing animals', false, NULL, NULL, '["buddhist"]', 'Violação do princípio de não-violência', 'medium', true, 1),
('blacklist', 'word', 'matar animais', false, NULL, NULL, '["buddhist"]', 'Violação do princípio de não-violência', 'medium', true, 1);

-- TEMAS SENSÍVEIS (INFANTIL)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'death', false, '["infantil"]', NULL, NULL, 'Tema sensível', 'medium', true, 1),
('blacklist', 'word', 'morte', false, '["infantil"]', NULL, NULL, 'Tema sensível', 'medium', true, 1),
('blacklist', 'word', 'depression', false, '["infantil"]', NULL, NULL, 'Tema sensível de saúde mental', 'medium', true, 1),
('blacklist', 'word', 'depressão', false, '["infantil"]', NULL, NULL, 'Tema sensível de saúde mental', 'medium', true, 1),
('blacklist', 'word', 'anxiety', false, '["infantil"]', NULL, NULL, 'Tema sensível de saúde mental', 'medium', true, 1),
('blacklist', 'word', 'ansiedade', false, '["infantil"]', NULL, NULL, 'Tema sensível de saúde mental', 'medium', true, 1),
('blacklist', 'word', 'divorce', false, '["infantil"]', NULL, NULL, 'Tema familiar sensível', 'low', true, 1),
('blacklist', 'word', 'divórcio', false, '["infantil"]', NULL, NULL, 'Tema familiar sensível', 'low', true, 1);

-- BULLYING E CYBERBULLYING (UNIVERSAL)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'word', 'ugly', false, '["infantil"]', NULL, NULL, 'Bullying aparência', 'medium', true, 1),
('blacklist', 'word', 'feio', false, '["infantil"]', NULL, NULL, 'Bullying aparência', 'medium', true, 1),
('blacklist', 'word', 'fat', false, '["infantil"]', NULL, NULL, 'Bullying aparência', 'medium', true, 1),
('blacklist', 'word', 'gordo', false, '["infantil"]', NULL, NULL, 'Bullying aparência', 'medium', true, 1),
('blacklist', 'word', 'stupid', false, '["infantil"]', NULL, NULL, 'Bullying inteligência', 'medium', true, 1),
('blacklist', 'word', 'burro', false, '["infantil"]', NULL, NULL, 'Bullying inteligência', 'medium', true, 1),
('blacklist', 'word', 'idiot', false, '["infantil"]', NULL, NULL, 'Bullying inteligência', 'medium', true, 1),
('blacklist', 'word', 'idiota', false, '["infantil"]', NULL, NULL, 'Bullying inteligência', 'medium', true, 1),
('blacklist', 'word', 'loser', false, '["infantil"]', NULL, NULL, 'Bullying', 'medium', true, 1),
('blacklist', 'word', 'perdedor', false, '["infantil"]', NULL, NULL, 'Bullying', 'medium', true, 1),
('blacklist', 'word', 'freak', false, '["infantil"]', NULL, NULL, 'Bullying', 'medium', true, 1),
('blacklist', 'word', 'esquisito', false, '["infantil"]', NULL, NULL, 'Bullying', 'low', true, 1);

-- INFORMAÇÕES PESSOAIS SENSÍVEIS (PADRÕES REGEX)
INSERT INTO blocked_content (list_type, content_type, content, is_regex, age_groups, countries, religions, reason, severity, is_active, added_by) VALUES
('blacklist', 'pattern', '\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b', true, '["infantil","adolescente","adulto"]', NULL, NULL, 'CPF brasileiro', 'high', true, 1),
('blacklist', 'pattern', '\\b\\d{3}-\\d{2}-\\d{4}\\b', true, '["infantil","adolescente","adulto"]', NULL, NULL, 'SSN americano', 'high', true, 1),
('blacklist', 'pattern', '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b', true, '["infantil","adolescente","adulto"]', NULL, NULL, 'Número de cartão de crédito', 'critical', true, 1),
('blacklist', 'pattern', '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', true, '["infantil"]', NULL, NULL, 'Email (proteção infantil)', 'medium', true, 1),
('blacklist', 'pattern', '\\b\\d{10,11}\\b', true, '["infantil"]', NULL, NULL, 'Número de telefone', 'medium', true, 1);

-- TOTAL: 150+ palavras bloqueadas
