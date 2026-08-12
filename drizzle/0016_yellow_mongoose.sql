CREATE TABLE `parental_content_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`alertId` int NOT NULL,
	`parentId` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`decision` enum('allow_temporarily','keep_blocked') NOT NULL,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parental_content_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `parental_content_decisions` ADD CONSTRAINT `parental_content_decisions_childId_child_profiles_id_fk` FOREIGN KEY (`childId`) REFERENCES `child_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parental_content_decisions` ADD CONSTRAINT `parental_content_decisions_alertId_parental_alerts_id_fk` FOREIGN KEY (`alertId`) REFERENCES `parental_alerts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parental_content_decisions` ADD CONSTRAINT `parental_content_decisions_parentId_users_id_fk` FOREIGN KEY (`parentId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;