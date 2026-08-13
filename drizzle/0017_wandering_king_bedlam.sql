ALTER TABLE `child_profiles` ADD `linkedUserId` int;--> statement-breakpoint
ALTER TABLE `child_profiles` ADD `linkCodeHash` varchar(64);--> statement-breakpoint
ALTER TABLE `child_profiles` ADD `linkCodeExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `child_profiles` ADD CONSTRAINT `child_profiles_linkedUserId_unique` UNIQUE(`linkedUserId`);--> statement-breakpoint
ALTER TABLE `child_profiles` ADD CONSTRAINT `child_profiles_linkedUserId_users_id_fk` FOREIGN KEY (`linkedUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;