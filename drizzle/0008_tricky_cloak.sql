CREATE TABLE `parental_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`guardian_name` varchar(200) NOT NULL,
	`guardian_document` varchar(50),
	`guardian_email` varchar(200),
	`relationship` varchar(50) NOT NULL,
	`confirmed_terms` boolean NOT NULL DEFAULT false,
	`confirmed_moral_conduct` boolean NOT NULL DEFAULT false,
	`confirmed_parental_control` boolean NOT NULL DEFAULT false,
	`confirmed_legal_compliance` boolean NOT NULL DEFAULT false,
	`consent_version` varchar(20) NOT NULL DEFAULT '1.0',
	`consent_at` timestamp DEFAULT (now()),
	`ip_address` varchar(45),
	`user_agent` text,
	`is_minor` boolean NOT NULL DEFAULT true,
	`user_age` int,
	CONSTRAINT `parental_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` enum('paywall_bypass','rate_limit_exceeded','scraping_detected','bot_detected','moral_violation','legal_violation','abuse_content','discrimination','unauthorized_access','suspicious_pattern','ddos_attempt','sql_injection','xss_attempt','other') NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`user_id` int,
	`ip_address` varchar(45),
	`user_agent` text,
	`endpoint` varchar(500),
	`description` text NOT NULL,
	`evidence` json,
	`action_taken` enum('blocked','rate_limited','account_banned','ip_blocked','content_removed','reported_to_authorities','admin_notified','none') DEFAULT 'none',
	`admin_notified` boolean DEFAULT false,
	`admin_notified_at` timestamp,
	`admin_tips` text,
	`legal_reference` varchar(500),
	`resolved` boolean DEFAULT false,
	`resolved_at` timestamp,
	`resolved_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `terms_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`terms_version` varchar(20) NOT NULL DEFAULT '1.0',
	`accepted_at` timestamp DEFAULT (now()),
	`ip_address` varchar(45),
	`user_agent` text,
	`confirmed_moral_conduct` boolean NOT NULL DEFAULT false,
	`confirmed_no_discrimination` boolean NOT NULL DEFAULT false,
	`confirmed_no_abuse` boolean NOT NULL DEFAULT false,
	`confirmed_legal_compliance` boolean NOT NULL DEFAULT false,
	`confirmed_age_verification` boolean NOT NULL DEFAULT false,
	CONSTRAINT `terms_acceptances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `parental_consents` ADD CONSTRAINT `parental_consents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `security_events` ADD CONSTRAINT `security_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `terms_acceptances` ADD CONSTRAINT `terms_acceptances_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;