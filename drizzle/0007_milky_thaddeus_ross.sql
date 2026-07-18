CREATE TABLE `vocab_expansions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word_id` varchar(20) NOT NULL,
	`pt_br` varchar(100) NOT NULL,
	`en_us` varchar(100) NOT NULL,
	`en_gb` varchar(100),
	`pronunciation` varchar(100),
	`category` varchar(50) NOT NULL,
	`frequency` int DEFAULT 5,
	`example` text,
	`example_pt` text,
	`scene` varchar(50) DEFAULT 'general',
	`batch_date` varchar(10) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `vocab_expansions_id` PRIMARY KEY(`id`),
	CONSTRAINT `vocab_expansions_word_id_unique` UNIQUE(`word_id`)
);
