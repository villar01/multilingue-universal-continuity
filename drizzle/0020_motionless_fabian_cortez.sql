CREATE TABLE `backup_snapshots` (
	`id` varchar(100) NOT NULL,
	`backup_type` enum('full','config','lessons','users') NOT NULL DEFAULT 'full',
	`storage_key` varchar(512) NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`encryption_version` varchar(20) NOT NULL DEFAULT 'aes-256-gcm-v1',
	`tables_backed_up` json NOT NULL,
	`total_records` int NOT NULL DEFAULT 0,
	`file_size_bytes` int NOT NULL DEFAULT 0,
	`status` enum('completed','failed','restoring') NOT NULL DEFAULT 'completed',
	`schedule_bucket` varchar(32),
	`created_at` bigint NOT NULL,
	`completed_at` bigint,
	CONSTRAINT `backup_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `backup_snapshots_schedule_bucket_unique` UNIQUE(`schedule_bucket`)
);
