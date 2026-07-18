ALTER TABLE `terms_acceptances` ADD `selfie_url` text;--> statement-breakpoint
ALTER TABLE `terms_acceptances` ADD `selfie_taken_at` timestamp;--> statement-breakpoint
ALTER TABLE `terms_acceptances` ADD `phone_verified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `terms_acceptances` ADD `email_verified` boolean DEFAULT false;