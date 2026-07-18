CREATE TABLE `daily_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeDate` varchar(10) NOT NULL,
	`scenario` varchar(100) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`conversationCompleted` boolean DEFAULT false,
	`wordGameCompleted` boolean DEFAULT false,
	`pronunciationScore` int DEFAULT 0,
	`xpEarned` int DEFAULT 0,
	`bonusEarned` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `daily_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_ranking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(100) NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`weeklyXp` int NOT NULL DEFAULT 0,
	`monthlyXp` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`conversationsCompleted` int NOT NULL DEFAULT 0,
	`wordsLearned` int NOT NULL DEFAULT 0,
	`perfectScores` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`badge` varchar(50) DEFAULT 'beginner',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `global_ranking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pronunciation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`word` varchar(200) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`scenario` varchar(100),
	`score` int NOT NULL,
	`userTranscript` text,
	`expectedText` text,
	`feedback` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `pronunciation_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `srs_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`word` varchar(200) NOT NULL,
	`translation` varchar(200) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`category` varchar(50),
	`easeFactor` float NOT NULL DEFAULT 2.5,
	`interval` int NOT NULL DEFAULT 1,
	`repetitions` int NOT NULL DEFAULT 0,
	`nextReview` timestamp DEFAULT (now()),
	`totalCorrect` int NOT NULL DEFAULT 0,
	`totalWrong` int NOT NULL DEFAULT 0,
	`lastSeen` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `srs_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vr_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scenario` varchar(100) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`mode` varchar(20) DEFAULT 'screen',
	`totalTurns` int NOT NULL DEFAULT 0,
	`avgPronunciationScore` int DEFAULT 0,
	`avgGrammarScore` int DEFAULT 0,
	`xpEarned` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`durationSeconds` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `vr_sessions_id` PRIMARY KEY(`id`)
);
