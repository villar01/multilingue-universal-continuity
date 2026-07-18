CREATE TABLE `crm_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contact_id` int,
	`deal_id` int,
	`user_id` int,
	`type` enum('call','email','meeting','whatsapp','demo','proposal_sent','follow_up','note','task') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`scheduled_at` timestamp,
	`completed_at` timestamp,
	`due_date` timestamp,
	`outcome` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50),
	`company` varchar(255),
	`job_title` varchar(100),
	`source` enum('website','referral','social_media','google_ads','facebook_ads','instagram','whatsapp','email_campaign','organic','partner','event','other') DEFAULT 'website',
	`segment` enum('individual','student','professional','company','educational_institution','ngo','government') DEFAULT 'individual',
	`status` enum('new','contacted','qualified','unqualified','customer','churned') DEFAULT 'new',
	`target_language` varchar(50),
	`native_language` varchar(50),
	`user_id` int,
	`notes` text,
	`tags` json,
	`country` varchar(100),
	`city` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contact_id` int NOT NULL,
	`assigned_to` int,
	`title` varchar(255) NOT NULL,
	`value` int DEFAULT 0,
	`currency` varchar(3) DEFAULT 'BRL',
	`plan_type` enum('monthly','annual','lifetime','team','institutional') DEFAULT 'monthly',
	`stage` enum('lead','qualified','proposal','negotiation','won','lost') DEFAULT 'lead',
	`probability` int DEFAULT 0,
	`expected_close_date` date,
	`closed_at` timestamp,
	`lost_reason` varchar(255),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`period` enum('daily','weekly','monthly','quarterly','annual') NOT NULL,
	`year` int NOT NULL,
	`month` int,
	`quarter` int,
	`revenue_target` int NOT NULL,
	`leads_target` int DEFAULT 0,
	`deals_target` int DEFAULT 0,
	`conversions_target` int DEFAULT 0,
	`assigned_to` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_targets_id` PRIMARY KEY(`id`)
);
