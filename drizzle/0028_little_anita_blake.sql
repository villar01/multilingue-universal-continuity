CREATE TABLE `user_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`achievement_id` int NOT NULL,
	`unlocked_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_achievements_user_achievement_unique` UNIQUE(`user_id`,`achievement_id`)
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`user_id` int NOT NULL,
	`total_xp` int NOT NULL DEFAULT 0,
	`current_level` int NOT NULL DEFAULT 1,
	`streak_days` int NOT NULL DEFAULT 0,
	`last_activity_date` date,
	`lessons_completed` int NOT NULL DEFAULT 0,
	`exercises_completed` int NOT NULL DEFAULT 0,
	`words_learned` int NOT NULL DEFAULT 0,
	`pronunciation_avg_score` float NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_stats_user_id` PRIMARY KEY(`user_id`)
);
