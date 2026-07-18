import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("No DATABASE_URL"); process.exit(1); }

const conn = await mysql.createConnection(DATABASE_URL);

const tables = [
  `CREATE TABLE IF NOT EXISTS global_ranking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    userName VARCHAR(100) NOT NULL,
    totalXp INT NOT NULL DEFAULT 0,
    weeklyXp INT NOT NULL DEFAULT 0,
    monthlyXp INT NOT NULL DEFAULT 0,
    currentStreak INT NOT NULL DEFAULT 0,
    longestStreak INT NOT NULL DEFAULT 0,
    conversationsCompleted INT NOT NULL DEFAULT 0,
    wordsLearned INT NOT NULL DEFAULT 0,
    perfectScores INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    badge VARCHAR(50) DEFAULT 'beginner',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user (userId)
  )`,
  `CREATE TABLE IF NOT EXISTS daily_challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    challengeDate VARCHAR(10) NOT NULL,
    scenario VARCHAR(100) NOT NULL,
    targetLanguage VARCHAR(10) NOT NULL,
    conversationCompleted BOOLEAN DEFAULT FALSE,
    wordGameCompleted BOOLEAN DEFAULT FALSE,
    pronunciationScore INT DEFAULT 0,
    xpEarned INT DEFAULT 0,
    bonusEarned BOOLEAN DEFAULT FALSE,
    completedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (userId, challengeDate)
  )`,
  `CREATE TABLE IF NOT EXISTS pronunciation_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    word VARCHAR(200) NOT NULL,
    targetLanguage VARCHAR(10) NOT NULL,
    scenario VARCHAR(100),
    score INT NOT NULL,
    userTranscript TEXT,
    expectedText TEXT,
    feedback TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS srs_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    word VARCHAR(200) NOT NULL,
    translation VARCHAR(200) NOT NULL,
    targetLanguage VARCHAR(10) NOT NULL,
    category VARCHAR(50),
    easeFactor FLOAT NOT NULL DEFAULT 2.5,
    intervalDays INT NOT NULL DEFAULT 1,
    repetitions INT NOT NULL DEFAULT 0,
    nextReview TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalCorrect INT NOT NULL DEFAULT 0,
    totalWrong INT NOT NULL DEFAULT 0,
    lastSeen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_word_lang (userId, word(100), targetLanguage)
  )`,
  `CREATE TABLE IF NOT EXISTS vr_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    scenario VARCHAR(100) NOT NULL,
    targetLanguage VARCHAR(10) NOT NULL,
    mode VARCHAR(20) DEFAULT 'screen',
    totalTurns INT NOT NULL DEFAULT 0,
    avgPronunciationScore INT DEFAULT 0,
    avgGrammarScore INT DEFAULT 0,
    xpEarned INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    durationSeconds INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
];

for (const sql of tables) {
  const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
  try {
    await conn.execute(sql);
    console.log(`✅ ${name}`);
  } catch(e) {
    console.error(`❌ ${name}: ${e.message}`);
  }
}

await conn.end();
console.log("Migration complete");
