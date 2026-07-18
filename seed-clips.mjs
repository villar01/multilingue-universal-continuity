import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn, { schema });

const clips = [
  {
    title: "Basic Greetings",
    description: "Learn essential greetings and introductions in everyday situations",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "A1",
    duration: 60,
    scriptData: JSON.stringify({ sentences: [], totalWords: 50, speakingRate: 120, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Common greetings vary by time of day"]),
    qualityScore: 95,
    verificationStatus: "approved"
  },
  {
    title: "Ordering Food",
    description: "Practice ordering food at restaurants and cafes",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "A2",
    duration: 90,
    scriptData: JSON.stringify({ sentences: [], totalWords: 80, speakingRate: 130, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Tipping customs in English-speaking countries"]),
    qualityScore: 92,
    verificationStatus: "approved"
  },
  {
    title: "Business Presentation",
    description: "Professional language for business presentations and meetings",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "B2",
    duration: 120,
    scriptData: JSON.stringify({ sentences: [], totalWords: 150, speakingRate: 140, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Business etiquette in presentations"]),
    qualityScore: 94,
    verificationStatus: "approved"
  },
  {
    title: "At the Store",
    description: "Shopping vocabulary and common retail interactions",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "A2",
    duration: 75,
    scriptData: JSON.stringify({ sentences: [], totalWords: 70, speakingRate: 125, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Return policies and customer service"]),
    qualityScore: 91,
    verificationStatus: "approved"
  },
  {
    title: "At the Airport",
    description: "Essential travel vocabulary for airports and flights",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "B1",
    duration: 100,
    scriptData: JSON.stringify({ sentences: [], totalWords: 100, speakingRate: 135, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Airport security procedures"]),
    qualityScore: 93,
    verificationStatus: "approved"
  },
  {
    title: "University Lecture",
    description: "Academic language and note-taking skills",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "C1",
    duration: 150,
    scriptData: JSON.stringify({ sentences: [], totalWords: 200, speakingRate: 145, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Academic discussion etiquette"]),
    qualityScore: 96,
    verificationStatus: "approved"
  },
  {
    title: "Making Friends",
    description: "Social language for making new friends and connections",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "A2",
    duration: 80,
    scriptData: JSON.stringify({ sentences: [], totalWords: 75, speakingRate: 128, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Social customs and small talk"]),
    qualityScore: 90,
    verificationStatus: "approved"
  },
  {
    title: "At the Doctor",
    description: "Medical vocabulary and describing symptoms",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "B1",
    duration: 95,
    scriptData: JSON.stringify({ sentences: [], totalWords: 90, speakingRate: 132, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Healthcare systems and appointments"]),
    qualityScore: 92,
    verificationStatus: "approved"
  },
  {
    title: "Tech Talk",
    description: "Technology and digital communication vocabulary",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "B2",
    duration: 110,
    scriptData: JSON.stringify({ sentences: [], totalWords: 120, speakingRate: 138, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Tech industry terminology"]),
    qualityScore: 94,
    verificationStatus: "approved"
  },
  {
    title: "Movie Night",
    description: "Entertainment vocabulary and discussing films",
    targetLanguage: "en",
    nativeLanguage: "pt",
    difficulty: "A2",
    duration: 85,
    scriptData: JSON.stringify({ sentences: [], totalWords: 78, speakingRate: 130, pauseMarkers: [] }),
    subtitlesData: JSON.stringify([]),
    vocabularyData: JSON.stringify([]),
    grammarData: JSON.stringify([]),
    culturalNotes: JSON.stringify(["Film genres and movie-going culture"]),
    qualityScore: 91,
    verificationStatus: "approved"
  }
];

console.log('Inserindo 10 clipes educacionais...');

for (const clip of clips) {
  await db.insert(schema.videoClips).values(clip);
  console.log(`✅ ${clip.title} inserido`);
}

console.log('\n✅ Todos os 10 clipes foram inseridos com sucesso!');

await conn.end();
