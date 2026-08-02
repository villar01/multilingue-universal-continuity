# MASTER_ANEXO_COMPLETO - Key Extracted Features for Adaptation

## Principles (from document)
1. **NEVER overwrite existing app code** - only ADD/EXTEND
2. Map existing components before integrating new code
3. DB schema is ADDITIVE - new tables alongside existing, no destructive migration
4. Professional quality: TypeScript strict, error handling, accessibility, performance
5. App destination has PRIORITY in case of name conflicts

## Bloco 5 - Parental Control Panel (REAL-TIME)
Features:
- PIN-protected access (4-digit PIN)
- Multi-child support (tabs to switch between children)
- Time limits: daily usage tracking, configurable limit slider (15-180 min)
- Day-of-week access control (enable/disable specific days)
- Progress dashboard: lessons completed, pronunciation accuracy, weekly chart
- Content level toggles: infantil/adolescente/adulto (parent approves levels)
- Alerts/notifications: time limit warnings, streak achievements, blocked access attempts
- Reset progress button per child
- Save settings with toast confirmation

Data structure per child:
- name, emoji, level, timeUsedToday, timeLimit
- days: {seg,ter,qua,qui,sex,sab,dom} - boolean
- lessonsThisWeek, accuracy, weekly[7] - minutes per day
- levelsAllowed: {infantil, adolescente, adulto} - boolean
- alerts: [{icon, title, detail, time}]

## Bloco 3 - Local AI & PAREDÃO Vocabulary
Features:
- PAREDÃO: 2000+ words per language, ranked by frequency
- 4 levels: inicial, intermediario, avancado, tecnico-cientifico
- Spaced repetition (SM-2 algorithm)
- Voice recognition for pronunciation practice
- AI decision log (transparent auto-development)
- Mastery tracking: 0-100% per word
- Due/ready for review status

## Bloco 1+2 - Lesson Engine + Virtual Teacher
Features:
- Teacher avatar with lip-sync (speaking animation)
- Vocabulary wall (flip cards with emoji + word)
- Exercise: multiple choice from vocab
- Listen & repeat: audio playback + typing
- XP system with progress bar
- Streak tracking
- Level stamps: infantil/adolescente/adulto/tecno
- Parental modal with PIN gate

## Bloco 6 - Branching Dialog Scenes
Features:
- Scene picker with level tags
- Dialogue with speaker avatars
- Branching choices that affect story
- Translation shown for each line
- Listen button for pronunciation
- End panel with XP reward

## DB Schema (Additive - Apêndice B3)
New tables to create:
- `languages` - language registry
- `paredao_words` - frequency vocabulary (2000+ per language)
- `translations` - word translations
- `content_gaps` - content generation queue
- `parental_settings` - per-child parental control config
- `child_profiles` - child accounts linked to parent
- `usage_sessions` - real-time usage tracking

## Pedagogical Flow (CORRECT ORDER)
1. Present vocabulary (PAREDÃO words for the lesson)
2. Show reading text using the vocabulary in context
3. Illustration/visual of the scene
4. Memorization exercises (repetition, association)
5. ONLY THEN ask questions about what was learned
