CREATE TABLE `battle_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_code` varchar(8) NOT NULL,
	`host_id` int NOT NULL,
	`guest_id` int,
	`target_language` varchar(20) NOT NULL,
	`category` varchar(50) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'waiting',
	`host_score` int,
	`guest_score` int,
	`host_words` int,
	`guest_words` int,
	`created_at` timestamp DEFAULT (now()),
	`started_at` timestamp,
	`finished_at` timestamp,
	CONSTRAINT `battle_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `battle_rooms_room_code_unique` UNIQUE(`room_code`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_name` varchar(100) NOT NULL,
	`target_language` varchar(20) NOT NULL,
	`language_name` varchar(50) NOT NULL,
	`issued_at` timestamp DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`)
);
