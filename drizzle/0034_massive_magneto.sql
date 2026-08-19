CREATE TABLE `maintenance_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(100) NOT NULL,
	`decision` enum('eligible','blocked','failed') NOT NULL,
	`summary` text NOT NULL,
	`detected_issues` int NOT NULL DEFAULT 0,
	`verifications` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_runs_id` PRIMARY KEY(`id`)
);
