ALTER TABLE `certificates` ADD `validation_code` varchar(48);--> statement-breakpoint
ALTER TABLE `certificates` ADD `revoked_at` timestamp;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_validation_code_unique` UNIQUE(`validation_code`);