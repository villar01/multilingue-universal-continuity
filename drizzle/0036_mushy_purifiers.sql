ALTER TABLE `customer_support_messages` DROP FOREIGN KEY `customer_support_messages_threadId_customer_support_threads_id_fk`;
--> statement-breakpoint
ALTER TABLE `customer_support_messages` DROP FOREIGN KEY `customer_support_messages_authorUserId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `customer_support_threads` DROP FOREIGN KEY `customer_support_threads_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `customer_support_messages` ADD CONSTRAINT `cs_msg_thread_fk` FOREIGN KEY (`threadId`) REFERENCES `customer_support_threads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_messages` ADD CONSTRAINT `cs_msg_author_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_threads` ADD CONSTRAINT `cs_thread_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;