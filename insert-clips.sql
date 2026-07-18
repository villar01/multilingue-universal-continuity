-- Inserir 10 clipes educacionais estilo Teacher Poli/Mondly
INSERT INTO video_clips (
  title,
  description,
  language,
  target_language,
  difficulty_level,
  category,
  duration_seconds,
  video_url,
  thumbnail_url,
  subtitle_data,
  quality_score,
  accent_variation,
  verification_status,
  created_at
) VALUES
-- Clip 1: Greetings - Beginner
('Basic Greetings', 'Learn how to greet people in English', 'pt-BR', 'en-US', 'beginner', 'daily', 45,
 'https://storage.manus.space/clips/greetings-basic.mp4',
 'https://storage.manus.space/clips/thumbs/greetings.jpg',
 '[{"start":0,"end":2,"text_target":"Hello!","text_native":"Olá!","words":[{"word":"Hello","start":0,"end":1.5}]},{"start":2.5,"end":4.5,"text_target":"How are you?","text_native":"Como você está?","words":[{"word":"How","start":2.5,"end":3},{"word":"are","start":3.1,"end":3.5},{"word":"you","start":3.6,"end":4.5}]}]',
 95, 'en-US-general-american', 'approved', NOW()),

-- Clip 2: Restaurant - Intermediate
('Ordering Food', 'Practice ordering at a restaurant', 'pt-BR', 'en-US', 'intermediate', 'travel', 60,
 'https://storage.manus.space/clips/restaurant-order.mp4',
 'https://storage.manus.space/clips/thumbs/restaurant.jpg',
 '[{"start":0,"end":3,"text_target":"I would like a coffee, please.","text_native":"Eu gostaria de um café, por favor.","words":[{"word":"I","start":0,"end":0.3},{"word":"would","start":0.4,"end":0.8},{"word":"like","start":0.9,"end":1.2},{"word":"a","start":1.3,"end":1.4},{"word":"coffee","start":1.5,"end":2},{"word":"please","start":2.2,"end":3}]}]',
 92, 'en-US-general-american', 'approved', NOW()),

-- Clip 3: Business Meeting - Advanced
('Business Presentation', 'Professional English for meetings', 'pt-BR', 'en-US', 'advanced', 'business', 90,
 'https://storage.manus.space/clips/business-meeting.mp4',
 'https://storage.manus.space/clips/thumbs/business.jpg',
 '[{"start":0,"end":4,"text_target":"Let me present our quarterly results.","text_native":"Deixe-me apresentar nossos resultados trimestrais.","words":[{"word":"Let","start":0,"end":0.4},{"word":"me","start":0.5,"end":0.7},{"word":"present","start":0.8,"end":1.5},{"word":"our","start":1.6,"end":1.9},{"word":"quarterly","start":2,"end":2.8},{"word":"results","start":2.9,"end":4}]}]',
 94, 'en-US-general-american', 'approved', NOW()),

-- Clip 4: Shopping - Beginner
('At the Store', 'Shopping vocabulary and phrases', 'pt-BR', 'en-US', 'beginner', 'daily', 50,
 'https://storage.manus.space/clips/shopping-basic.mp4',
 'https://storage.manus.space/clips/thumbs/shopping.jpg',
 '[{"start":0,"end":2.5,"text_target":"How much is this?","text_native":"Quanto custa isso?","words":[{"word":"How","start":0,"end":0.5},{"word":"much","start":0.6,"end":1},{"word":"is","start":1.1,"end":1.3},{"word":"this","start":1.4,"end":2.5}]}]',
 93, 'en-US-general-american', 'approved', NOW()),

-- Clip 5: Travel - Intermediate
('At the Airport', 'Airport vocabulary and situations', 'pt-BR', 'en-US', 'intermediate', 'travel', 75,
 'https://storage.manus.space/clips/airport-travel.mp4',
 'https://storage.manus.space/clips/thumbs/airport.jpg',
 '[{"start":0,"end":3.5,"text_target":"Where is the boarding gate?","text_native":"Onde fica o portão de embarque?","words":[{"word":"Where","start":0,"end":0.5},{"word":"is","start":0.6,"end":0.8},{"word":"the","start":0.9,"end":1},{"word":"boarding","start":1.1,"end":1.8},{"word":"gate","start":2,"end":3.5}]}]',
 91, 'en-US-general-american', 'approved', NOW()),

-- Clip 6: Academic - Advanced
('University Lecture', 'Academic English vocabulary', 'pt-BR', 'en-US', 'advanced', 'academic', 120,
 'https://storage.manus.space/clips/university-lecture.mp4',
 'https://storage.manus.space/clips/thumbs/academic.jpg',
 '[{"start":0,"end":5,"text_target":"Today we will discuss the theory of relativity.","text_native":"Hoje discutiremos a teoria da relatividade.","words":[{"word":"Today","start":0,"end":0.6},{"word":"we","start":0.7,"end":0.9},{"word":"will","start":1,"end":1.3},{"word":"discuss","start":1.4,"end":2.2},{"word":"the","start":2.3,"end":2.5},{"word":"theory","start":2.6,"end":3.2},{"word":"of","start":3.3,"end":3.5},{"word":"relativity","start":3.6,"end":5}]}]',
 96, 'en-US-general-american', 'approved', NOW()),

-- Clip 7: Social - Intermediate
('Making Friends', 'Social conversation starters', 'pt-BR', 'en-US', 'intermediate', 'social', 55,
 'https://storage.manus.space/clips/making-friends.mp4',
 'https://storage.manus.space/clips/thumbs/social.jpg',
 '[{"start":0,"end":3,"text_target":"What do you do for fun?","text_native":"O que você faz para se divertir?","words":[{"word":"What","start":0,"end":0.4},{"word":"do","start":0.5,"end":0.7},{"word":"you","start":0.8,"end":1},{"word":"do","start":1.1,"end":1.3},{"word":"for","start":1.4,"end":1.6},{"word":"fun","start":1.7,"end":3}]}]',
 90, 'en-US-general-american', 'approved', NOW()),

-- Clip 8: Health - Beginner
('At the Doctor', 'Medical vocabulary basics', 'pt-BR', 'en-US', 'beginner', 'daily', 65,
 'https://storage.manus.space/clips/doctor-visit.mp4',
 'https://storage.manus.space/clips/thumbs/health.jpg',
 '[{"start":0,"end":2.5,"text_target":"I have a headache.","text_native":"Estou com dor de cabeça.","words":[{"word":"I","start":0,"end":0.2},{"word":"have","start":0.3,"end":0.6},{"word":"a","start":0.7,"end":0.8},{"word":"headache","start":0.9,"end":2.5}]}]',
 92, 'en-US-general-american', 'approved', NOW()),

-- Clip 9: Technology - Advanced
('Tech Talk', 'Technology and innovation vocabulary', 'pt-BR', 'en-US', 'advanced', 'business', 100,
 'https://storage.manus.space/clips/tech-innovation.mp4',
 'https://storage.manus.space/clips/thumbs/tech.jpg',
 '[{"start":0,"end":4.5,"text_target":"Artificial intelligence is transforming industries.","text_native":"A inteligência artificial está transformando indústrias.","words":[{"word":"Artificial","start":0,"end":0.9},{"word":"intelligence","start":1,"end":2.2},{"word":"is","start":2.3,"end":2.5},{"word":"transforming","start":2.6,"end":3.8},{"word":"industries","start":3.9,"end":4.5}]}]',
 95, 'en-US-general-american', 'approved', NOW()),

-- Clip 10: Entertainment - Intermediate
('Movie Night', 'Entertainment and leisure vocabulary', 'pt-BR', 'en-US', 'intermediate', 'social', 70,
 'https://storage.manus.space/clips/movie-night.mp4',
 'https://storage.manus.space/clips/thumbs/entertainment.jpg',
 '[{"start":0,"end":3.5,"text_target":"Have you seen the new movie?","text_native":"Você viu o novo filme?","words":[{"word":"Have","start":0,"end":0.4},{"word":"you","start":0.5,"end":0.7},{"word":"seen","start":0.8,"end":1.2},{"word":"the","start":1.3,"end":1.5},{"word":"new","start":1.6,"end":2},{"word":"movie","start":2.1,"end":3.5}]}]',
 91, 'en-US-general-american', 'approved', NOW());
