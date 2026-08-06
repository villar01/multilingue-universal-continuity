CREATE TABLE `app_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(20) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text,
	`severity` varchar(20) DEFAULT 'info',
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_updates_read` (
	`id` int AUTO_INCREMENT NOT NULL,
	`updateId` int NOT NULL,
	`userId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_updates_read_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `child_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`emoji` varchar(10) DEFAULT '👧',
	`level` enum('infantil','adolescente','adulto') DEFAULT 'infantil',
	`birthDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `child_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parental_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`alertType` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`detail` text,
	`icon` varchar(10) DEFAULT '⚠️',
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parental_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parental_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`pinCode` varchar(4) DEFAULT '1234',
	`timeLimitMinutes` int DEFAULT 60,
	`allowedDays` json,
	`levelsAllowed` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parental_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`sessionStart` timestamp NOT NULL DEFAULT (now()),
	`sessionEnd` timestamp,
	`minutesUsed` int DEFAULT 0,
	`lessonsCompleted` int DEFAULT 0,
	`accuracyScore` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `app_updates_read` ADD CONSTRAINT `app_updates_read_updateId_app_updates_id_fk` FOREIGN KEY (`updateId`) REFERENCES `app_updates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `child_profiles` ADD CONSTRAINT `child_profiles_parentId_users_id_fk` FOREIGN KEY (`parentId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parental_alerts` ADD CONSTRAINT `parental_alerts_childId_child_profiles_id_fk` FOREIGN KEY (`childId`) REFERENCES `child_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parental_settings` ADD CONSTRAINT `parental_settings_childId_child_profiles_id_fk` FOREIGN KEY (`childId`) REFERENCES `child_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_sessions` ADD CONSTRAINT `usage_sessions_childId_child_profiles_id_fk` FOREIGN KEY (`childId`) REFERENCES `child_profiles`(`id`) ON DELETE cascade ON UPDATE no action;