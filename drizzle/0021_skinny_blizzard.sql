CREATE TABLE `backup_schedule_config` (
	`id` varchar(32) NOT NULL,
	`heartbeat_task_uid` varchar(65) NOT NULL,
	`cron_expression` varchar(64) NOT NULL,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `backup_schedule_config_id` PRIMARY KEY(`id`)
);
