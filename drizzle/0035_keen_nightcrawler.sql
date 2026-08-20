CREATE TABLE `customer_support_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`authorRole` enum('customer','admin') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_support_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(180) NOT NULL,
	`category` enum('help','bug','feedback','idea','security') NOT NULL,
	`status` enum('open','in_review','replied','closed') NOT NULL DEFAULT 'open',
	`priority` enum('normal','high') NOT NULL DEFAULT 'normal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`closedAt` timestamp,
	CONSTRAINT `customer_support_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customer_support_messages` ADD CONSTRAINT `customer_support_messages_threadId_customer_support_threads_id_fk` FOREIGN KEY (`threadId`) REFERENCES `customer_support_threads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_messages` ADD CONSTRAINT `customer_support_messages_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_threads` ADD CONSTRAINT `customer_support_threads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;