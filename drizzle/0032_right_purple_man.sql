ALTER TABLE `parental_optional_data_retention_schedule` ADD CONSTRAINT `parental_retention_task_uid_unq` UNIQUE(`heartbeat_task_uid`);
