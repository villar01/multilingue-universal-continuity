CREATE TABLE `app_telemetry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`context` varchar(255),
	`message` text,
	`stack` text,
	`url` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `app_telemetry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(6) NOT NULL,
	`verified` boolean DEFAULT false,
	`verified_at` timestamp,
	`ip_address` varchar(45),
	`user_agent` text,
	`attempts` int DEFAULT 0,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`is_guardian_email` boolean DEFAULT false,
	`guardian_name` varchar(200),
	CONSTRAINT `email_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phone_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`country_code` varchar(5) DEFAULT '+55',
	`code` varchar(6) NOT NULL,
	`verified` boolean DEFAULT false,
	`verified_at` timestamp,
	`ip_address` varchar(45),
	`user_agent` text,
	`attempts` int DEFAULT 0,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`is_guardian_phone` boolean DEFAULT false,
	`guardian_name` varchar(200),
	CONSTRAINT `phone_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `dailyGoalMinutes` int DEFAULT 10;--> statement-breakpoint
ALTER TABLE `users` ADD `streak_days` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `last_lesson_date` date;--> statement-breakpoint
ALTER TABLE `users` ADD `total_xp` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `current_level` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `hearts` int DEFAULT 5;--> statement-breakpoint
ALTER TABLE `users` ADD `max_hearts` int DEFAULT 5;--> statement-breakpoint
ALTER TABLE `users` ADD `hearts_refill_at` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `daily_minutes_today` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `daily_goal_date` date;--> statement-breakpoint
ALTER TABLE `users` ADD `longest_streak` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `preferred_teacher_id` int;