ALTER TABLE `child_profiles` ADD `parentalConsentGiven` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `child_profiles` ADD `parentalConsentAt` timestamp;