CREATE TABLE `learning_trials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`lesson_limit` int NOT NULL DEFAULT 10,
	`lessons_used` int NOT NULL DEFAULT 0,
	`status` enum('active','limit_reached','converted','expired') NOT NULL DEFAULT 'active',
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`limit_reached_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learning_trials_id` PRIMARY KEY(`id`),
	CONSTRAINT `learning_trials_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `trial_lesson_accesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`lesson_key` varchar(160) NOT NULL,
	`accessed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trial_lesson_accesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `trial_lesson_user_key_unique` UNIQUE(`user_id`,`lesson_key`)
);
--> statement-breakpoint
ALTER TABLE `learning_trials` ADD CONSTRAINT `learning_trials_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trial_lesson_accesses` ADD CONSTRAINT `trial_lesson_accesses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;