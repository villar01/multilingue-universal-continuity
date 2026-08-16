CREATE TABLE `parental_optional_data_retention_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`heartbeat_task_uid` varchar(65),
	`created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `parental_optional_data_retention_schedule_id` PRIMARY KEY(`id`)
);
