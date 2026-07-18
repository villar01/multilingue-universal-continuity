CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`category` varchar(50),
	`requirementType` varchar(50) NOT NULL,
	`requirementValue` int NOT NULL,
	`pointsReward` int DEFAULT 0,
	`badgeUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_admin_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`topic` varchar(255),
	`category` enum('feature_request','bug_report','optimization','content_improvement','user_experience','ai_training','general') DEFAULT 'general',
	`status` enum('active','resolved','archived') DEFAULT 'active',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`summary` text,
	`action_items` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolved_at` timestamp,
	CONSTRAINT `ai_admin_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_admin_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`role` enum('admin','ai') NOT NULL,
	`content` text NOT NULL,
	`message_type` enum('feedback','suggestion','question','insight','analysis','recommendation') DEFAULT 'feedback',
	`structured_data` json,
	`was_helpful` boolean,
	`was_implemented` boolean DEFAULT false,
	`implemented_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ai_admin_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cacheKey` varchar(255) NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`language` varchar(10),
	`modelUsed` varchar(100),
	`tokensUsed` int,
	`hitCount` int NOT NULL DEFAULT 0,
	`lastAccessed` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_cache_cacheKey_unique` UNIQUE(`cacheKey`)
);
--> statement-breakpoint
CREATE TABLE `aiImprovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetType` enum('lesson','exercise','phrase','grammar','vocabulary') NOT NULL,
	`targetId` int NOT NULL,
	`improvementType` varchar(100) NOT NULL,
	`currentVersion` json NOT NULL,
	`proposedVersion` json NOT NULL,
	`reasoning` text NOT NULL,
	`dataSupport` json,
	`level` enum('basic','intermediate','advanced') NOT NULL,
	`specialization` enum('general','business','trading','scientific'),
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','approved','rejected','deployed','rolled_back') DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`deployedAt` timestamp,
	`deploymentStrategy` varchar(50),
	`affectedStudents` int DEFAULT 0,
	`successRate` float,
	`studentFeedback` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiImprovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insight_type` enum('user_behavior','content_gap','performance_issue','engagement_pattern','learning_effectiveness','system_optimization') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`data_source` varchar(100),
	`metrics` json,
	`affected_users` int,
	`recommendations` json,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`status` enum('new','reviewed','in_progress','resolved','dismissed') DEFAULT 'new',
	`admin_notes` text,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`context` json NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`modelUsed` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `auto_payment_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expense_id` int,
	`provider` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`frequency` enum('monthly','quarterly','yearly') NOT NULL,
	`day_of_month` int,
	`payment_method` varchar(50) NOT NULL,
	`payment_details` json,
	`is_active` boolean DEFAULT true,
	`last_payment_date` timestamp,
	`next_payment_date` timestamp,
	`notify_before_days` int DEFAULT 3,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_payment_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avatar_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clipId` int NOT NULL,
	`avatarUrl` varchar(512) NOT NULL,
	`lipSyncDataUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avatar_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `behavioralAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`learningStyle` enum('visual','auditory','kinesthetic','reading'),
	`learningSpeed` float DEFAULT 1,
	`optimalSessionDuration` int DEFAULT 20,
	`optimalTimeOfDay` varchar(20),
	`circadianPattern` json,
	`frustrationLevel` float DEFAULT 0,
	`engagementScore` float DEFAULT 0.5,
	`motivationLevel` float DEFAULT 0.5,
	`strongAreas` json,
	`weakAreas` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `behavioralAnalysis_id` PRIMARY KEY(`id`),
	CONSTRAINT `behavioralAnalysis_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `blocked_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`list_type` enum('blacklist','whitelist') NOT NULL,
	`content_type` enum('word','phrase','pattern','topic') NOT NULL,
	`content` varchar(500) NOT NULL,
	`is_regex` boolean DEFAULT false,
	`age_groups` json,
	`countries` json,
	`religions` json,
	`reason` text,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`is_active` boolean DEFAULT true,
	`added_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blocked_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`type` enum('daily','weekly','custom') NOT NULL,
	`targetType` varchar(50) NOT NULL,
	`targetValue` int NOT NULL,
	`currentValue` int DEFAULT 0,
	`pointsReward` int DEFAULT 0,
	`status` enum('active','completed','expired') DEFAULT 'active',
	`expiresAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clip_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clipId` int NOT NULL,
	`interactionType` enum('view','like','save','share') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clip_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `completedLessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`score` int DEFAULT 0,
	`xpEarned` int DEFAULT 0,
	`timeSpentSeconds` int DEFAULT 0,
	`attemptsCount` int DEFAULT 1,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `completedLessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_moderation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rule_type` enum('age_based','country_based','religion_based','custom') NOT NULL,
	`target_age_group` enum('infantil','adolescente','adulto','all') DEFAULT 'all',
	`target_country` varchar(10),
	`target_religion` enum('christian','muslim','jewish','buddhist','hindu','secular','all') DEFAULT 'all',
	`blocked_words` json,
	`blocked_patterns` json,
	`sensitive_topics` json,
	`violation_action` enum('warn','block','reformulate','escalate') DEFAULT 'block',
	`is_active` boolean DEFAULT true,
	`priority` int DEFAULT 0,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_moderation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`content` json NOT NULL,
	`changeType` varchar(50) NOT NULL,
	`changedBy` int,
	`changeReason` text,
	`isBackup` boolean DEFAULT true,
	`isActive` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contextualPhrases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`languageCode` varchar(10) NOT NULL,
	`phraseText` text NOT NULL,
	`translation` text NOT NULL,
	`ipa` text,
	`context` text NOT NULL,
	`situationType` varchar(100) NOT NULL,
	`formalityLevel` enum('very_formal','formal','neutral','informal','very_informal') NOT NULL,
	`category` varchar(100) NOT NULL,
	`specialization` enum('general','business','trading','scientific') DEFAULT 'general',
	`cefrLevel` enum('A1','A2','B1','B2','C1','C2') NOT NULL,
	`difficultyScore` float DEFAULT 0.5,
	`audioUrl` text,
	`audioProvider` varchar(50),
	`timesUsed` int DEFAULT 0,
	`averageRetention` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contextualPhrases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`conversation_type` enum('lesson_chat','pronunciation_feedback','grammar_help','general_chat') NOT NULL,
	`user_message` text,
	`ai_response` text,
	`lesson_id` int,
	`exercise_id` int,
	`moderation_score` float DEFAULT 0,
	`flagged_content` json,
	`was_blocked` boolean DEFAULT false,
	`was_reformulated` boolean DEFAULT false,
	`original_ai_response` text,
	`user_age_group` enum('infantil','adolescente','adulto'),
	`user_country` varchar(10),
	`user_religion` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scenarioId` int NOT NULL,
	`nodeId` int NOT NULL,
	`userText` text NOT NULL,
	`audioUrl` varchar(500),
	`transcribedText` text,
	`grammarScore` int,
	`pronunciationScore` int,
	`vocabularyScore` int,
	`fluencyScore` int,
	`overallScore` int,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`cefrLevel` varchar(5) NOT NULL,
	`language` varchar(10) NOT NULL,
	`setting` varchar(255),
	`context` text,
	`objectives` json,
	`vocabularyDensity` int,
	`grammarComplexity` int,
	`culturalContext` text,
	`estimatedDuration` int,
	`dialogueCount` int,
	`branchingPaths` int,
	`viewCount` int DEFAULT 0,
	`likeCount` int DEFAULT 0,
	`completionRate` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversation_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`level` enum('beginner','intermediate','advanced','native') NOT NULL,
	`estimatedHours` int,
	`lessonCount` int DEFAULT 0,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deploymentLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`improvementId` int NOT NULL,
	`strategy` varchar(50) NOT NULL,
	`percentage` int NOT NULL,
	`studentsAffected` int NOT NULL,
	`status` enum('in_progress','completed','failed','rolled_back') NOT NULL,
	`successRate` float,
	`errorRate` float,
	`avgPerformanceChange` float,
	`logs` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `deploymentLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dialogue_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`nodeIndex` int NOT NULL,
	`npcRole` varchar(100) NOT NULL,
	`npcDialogue` text NOT NULL,
	`npcAudioUrl` varchar(500),
	`npcVoiceId` varchar(100),
	`npcAccent` varchar(50),
	`contextHint` text,
	`suggestedResponses` json,
	`parentNodeId` int,
	`childNodeIds` json,
	`commonMistakes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dialogue_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dialogues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`native_language_code` varchar(10) NOT NULL,
	`target_language_code` varchar(10) NOT NULL,
	`native_text` text NOT NULL,
	`target_text` text NOT NULL,
	`native_audio_url` varchar(500),
	`target_audio_url` varchar(500),
	`tutor_comment` text,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`category` varchar(100),
	`order_index` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `dialogues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dynamicContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`languageId` int NOT NULL,
	`contentType` enum('exercise','dialogue','story','explanation') NOT NULL,
	`generatedContent` json NOT NULL,
	`prompt` text,
	`difficultyLevel` float DEFAULT 0.5,
	`topics` json,
	`wasUsed` boolean DEFAULT false,
	`effectivenessScore` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dynamicContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educational_clips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`languageId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` varchar(512) NOT NULL,
	`thumbnailUrl` varchar(512),
	`duration` int,
	`cefrLevel` enum('A1','A2','B1','B2','C1','C2') NOT NULL,
	`category` varchar(100),
	`tags` json,
	`viewCount` int DEFAULT 0,
	`likeCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `educational_clips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `errorPatterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`errorType` varchar(100) NOT NULL,
	`errorCategory` varchar(100),
	`frequency` int DEFAULT 1,
	`severity` float DEFAULT 0.5,
	`suggestedExerciseId` int,
	`remediationStrategy` text,
	`lastOccurrence` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `errorPatterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`type` enum('multiple_choice','fill_blank','translation','listening','speaking','conversation','writing') NOT NULL,
	`question` text NOT NULL,
	`correctAnswer` text NOT NULL,
	`options` json,
	`orderIndex` int NOT NULL,
	`difficultyScore` float DEFAULT 0.5,
	`points` int DEFAULT 10,
	`audioUrl` text,
	`audioText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('hosting','payment_gateway','domain','software','marketing','taxes','other') NOT NULL,
	`description` text NOT NULL,
	`provider` varchar(200),
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`is_recurring` boolean DEFAULT false,
	`recurring_frequency` enum('monthly','quarterly','yearly','one_time') DEFAULT 'one_time',
	`next_due_date` timestamp,
	`auto_pay_enabled` boolean DEFAULT false,
	`payment_method` varchar(50),
	`status` enum('pending','paid','overdue','cancelled') DEFAULT 'pending',
	`receipt_url` text,
	`invoice_url` text,
	`receipt_number` varchar(100),
	`due_date` timestamp,
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`total_revenue` int NOT NULL DEFAULT 0,
	`total_fees` int NOT NULL DEFAULT 0,
	`net_revenue` int NOT NULL DEFAULT 0,
	`total_expenses` int NOT NULL DEFAULT 0,
	`total_taxes` int NOT NULL DEFAULT 0,
	`gross_profit` int NOT NULL DEFAULT 0,
	`net_profit` int NOT NULL DEFAULT 0,
	`new_subscribers` int DEFAULT 0,
	`churned_subscribers` int DEFAULT 0,
	`active_subscribers` int DEFAULT 0,
	`ai_analysis` text,
	`ai_recommendations` json,
	`is_finalized` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`invoiceNumber` varchar(100) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`pdfUrl` text,
	`xmlUrl` text,
	`status` enum('pending','issued','cancelled') DEFAULT 'pending',
	`issuedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`nativeName` varchar(100) NOT NULL,
	`flag` varchar(10),
	`isActive` boolean DEFAULT true,
	`elevenLabsVoiceId` varchar(100),
	`elevenLabsVoiceName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`),
	CONSTRAINT `languages_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `learningHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`attemptNumber` int DEFAULT 1,
	`isCorrect` boolean NOT NULL,
	`userAnswer` text,
	`timeSpentSeconds` int NOT NULL,
	`confidenceLevel` float,
	`perceivedDifficulty` float,
	`errorType` varchar(100),
	`errorDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learningHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonSpecializations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`specialization` enum('business','trading','scientific') NOT NULL,
	`industryTerms` json,
	`realWorldScenarios` json,
	`professionalExamples` text,
	`externalResources` json,
	`caseStudies` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessonSpecializations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`orderIndex` int NOT NULL,
	`content` text,
	`vocabulary` json,
	`grammar` json,
	`illustrationUrl` text,
	`storyText` text,
	`vocabularyDetailed` json,
	`grammarDetailed` json,
	`phonetics` json,
	`conversationPrompts` json,
	`estimatedMinutes` int DEFAULT 10,
	`difficultyScore` float DEFAULT 0.5,
	`ageLevel` enum('infantil','adolescente','adulto') NOT NULL DEFAULT 'adulto',
	`audioUrl` text,
	`languageCode` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lip_sync_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avatarVideoId` int NOT NULL,
	`timestamp` int NOT NULL,
	`viseme` varchar(10) NOT NULL,
	`intensity` int DEFAULT 100,
	CONSTRAINT `lip_sync_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` enum('ai_request','cache_hit','cache_miss','translation','avatar_render','optimization') NOT NULL,
	`provider` varchar(50),
	`tokensUsed` int DEFAULT 0,
	`tokensSaved` int DEFAULT 0,
	`responseTime` float,
	`cacheHit` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderation_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_log_id` int NOT NULL,
	`user_id` int NOT NULL,
	`violation_type` enum('inappropriate_content','violence','profanity','sexual_content','hate_speech','personal_info','bullying','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`detected_content` text,
	`violated_rules` json,
	`status` enum('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
	`reviewed_by` int,
	`review_notes` text,
	`reviewed_at` timestamp,
	`action_taken` enum('none','warning_sent','content_blocked','user_suspended','escalated'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moderation_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','success','warning','achievement','new_lesson') DEFAULT 'info',
	`relatedId` int,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offlineSyncQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityData` json NOT NULL,
	`synced` boolean DEFAULT false,
	`syncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `offlineSyncQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metric_date` timestamp NOT NULL,
	`metric_type` varchar(100) NOT NULL,
	`active_users` int DEFAULT 0,
	`new_users` int DEFAULT 0,
	`returning_users` int DEFAULT 0,
	`churned_users` int DEFAULT 0,
	`lessons_completed` int DEFAULT 0,
	`average_session_duration` int DEFAULT 0,
	`average_accuracy` float DEFAULT 0,
	`free_to_premium` int DEFAULT 0,
	`revenue` int DEFAULT 0,
	`most_popular_languages` json,
	`most_popular_lessons` json,
	`average_rating` float,
	`feedback_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `platform_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pronunciationAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int,
	`audioUrl` text NOT NULL,
	`targetText` text NOT NULL,
	`transcribedText` text NOT NULL,
	`accuracyScore` float NOT NULL,
	`phonemeErrors` json,
	`intonationScore` float,
	`rhythmScore` float,
	`feedback` text,
	`suggestedImprovements` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pronunciationAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`receipt_type` enum('payment_received','expense_payment','tax_payment','refund','other') NOT NULL,
	`revenue_id` int,
	`expense_id` int,
	`tax_id` int,
	`receipt_number` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`payer` varchar(255),
	`payee` varchar(255),
	`pdf_url` text,
	`image_url` text,
	`issued_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `receipts_receipt_number_unique` UNIQUE(`receipt_number`)
);
--> statement-breakpoint
CREATE TABLE `revenues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('subscription','one_time_payment','refund','other') NOT NULL,
	`user_id` int,
	`subscription_id` int,
	`gross_amount` int NOT NULL,
	`fees` int NOT NULL DEFAULT 0,
	`net_amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`payment_method` varchar(50) DEFAULT 'pix',
	`transaction_id` varchar(200),
	`pagbank_transaction_id` varchar(200),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`receipt_url` text,
	`receipt_number` varchar(100),
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('monthly','annual','lifetime') NOT NULL,
	`status` enum('active','cancelled','expired') DEFAULT 'active',
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`cancelledAt` timestamp,
	`paymentMethod` varchar(50) DEFAULT 'pix',
	`transactionId` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_improvements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`source` enum('admin_feedback','ai_suggestion','user_request','automated_analysis') NOT NULL,
	`source_id` int,
	`category` varchar(100) NOT NULL,
	`impact_area` json,
	`before_metrics` json,
	`after_metrics` json,
	`estimated_impact` text,
	`actual_impact` text,
	`status` enum('planned','in_progress','completed','rolled_back') DEFAULT 'planned',
	`implemented_by` int,
	`implemented_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_improvements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tax_type` enum('income_tax','iss','pis','cofins','csll','other') NOT NULL,
	`reference_month` int NOT NULL,
	`reference_year` int NOT NULL,
	`base_amount` int NOT NULL,
	`tax_rate` float NOT NULL,
	`tax_amount` int NOT NULL,
	`status` enum('calculated','paid','overdue') DEFAULT 'calculated',
	`due_date` timestamp,
	`paid_at` timestamp,
	`payment_receipt_url` text,
	`payment_guide_url` text,
	`barcode` varchar(200),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`bio` text,
	`avatarUrl` varchar(512),
	`language` varchar(10) NOT NULL,
	`specialty` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacher_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceText` text NOT NULL,
	`sourceLang` varchar(10) NOT NULL,
	`targetLang` varchar(10) NOT NULL,
	`translatedText` text NOT NULL,
	`cacheKey` varchar(255) NOT NULL,
	`hitCount` int NOT NULL DEFAULT 0,
	`lastAccessed` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `translation_cache_cacheKey_unique` UNIQUE(`cacheKey`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_dialogue_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`dialogue_id` int NOT NULL,
	`pronunciation_score` int,
	`attempts` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`last_attempt_at` timestamp,
	`completed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_dialogue_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`currentLessonId` int,
	`completedLessons` int DEFAULT 0,
	`totalLessons` int DEFAULT 0,
	`progressPercentage` float DEFAULT 0,
	`totalPoints` int DEFAULT 0,
	`currentStreak` int DEFAULT 0,
	`longestStreak` int DEFAULT 0,
	`lastStudyDate` timestamp,
	`totalStudyMinutes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_safety_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`age_group` enum('infantil','adolescente','adulto') NOT NULL,
	`date_of_birth` date,
	`country` varchar(10),
	`religion` varchar(50),
	`parental_consent_given` boolean DEFAULT false,
	`parent_email` varchar(255),
	`parent_consent_date` timestamp,
	`moderation_level` enum('strict','moderate','relaxed') DEFAULT 'moderate',
	`custom_blocked_words` json,
	`violation_count` int DEFAULT 0,
	`last_violation_date` timestamp,
	`is_restricted` boolean DEFAULT false,
	`restriction_reason` text,
	`restriction_end_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_safety_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_safety_profile_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_video_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`video_scene_id` int NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`attempts` int NOT NULL DEFAULT 0,
	`best_score` int NOT NULL DEFAULT 0,
	`user_audio_url` text,
	`pronunciation_score` int,
	`intonation_score` int,
	`speed_score` int,
	`feedback` text,
	`completed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_video_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`nativeLanguage` varchar(10),
	`learningGoal` text,
	`dailyGoalMinutes` int DEFAULT 15,
	`subscriptionType` enum('free','monthly','annual','lifetime') DEFAULT 'free',
	`subscriptionTier` enum('free','premium','vip') NOT NULL DEFAULT 'free',
	`subscriptionExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `video_clips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`target_language` varchar(10) NOT NULL,
	`native_language` varchar(10) NOT NULL,
	`difficulty` enum('A1','A2','B1','B2','C1','C2') NOT NULL,
	`duration` int NOT NULL,
	`video_url` varchar(500),
	`thumbnail_url` varchar(500),
	`script_data` text,
	`subtitles_data` text,
	`vocabulary_data` text,
	`grammar_data` text,
	`cultural_notes` text,
	`quality_score` int DEFAULT 0,
	`verification_status` enum('pending','verified','approved') DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_clips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`video_url` text NOT NULL,
	`thumbnail_url` text,
	`duration` int NOT NULL,
	`transcript` text NOT NULL,
	`target_phrase` text NOT NULL,
	`category` varchar(100),
	`difficulty` int NOT NULL DEFAULT 1,
	`order_index` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_scenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `virtual_teachers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`title` varchar(100) NOT NULL,
	`gender` enum('male','female','neutral') NOT NULL,
	`avatar_style` varchar(50) NOT NULL,
	`skin_tone` varchar(20) NOT NULL,
	`hair_color` varchar(20) NOT NULL,
	`hair_style` varchar(50) NOT NULL,
	`personality` text NOT NULL,
	`teaching_style` text NOT NULL,
	`specialties` json,
	`voice_gender` enum('MALE','FEMALE','NEUTRAL') NOT NULL,
	`voice_language_code` varchar(10) NOT NULL,
	`greetings` json,
	`encouragements` json,
	`corrections` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `virtual_teachers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`referral_code` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `waitlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `ai_admin_messages` ADD CONSTRAINT `ai_admin_messages_conversation_id_ai_admin_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `ai_admin_conversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_payment_configs` ADD CONSTRAINT `auto_payment_configs_expense_id_expenses_id_fk` FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `completedLessons` ADD CONSTRAINT `completedLessons_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `completedLessons` ADD CONSTRAINT `completedLessons_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_language_id_languages_id_fk` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deploymentLogs` ADD CONSTRAINT `deploymentLogs_improvementId_aiImprovements_id_fk` FOREIGN KEY (`improvementId`) REFERENCES `aiImprovements`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessonSpecializations` ADD CONSTRAINT `lessonSpecializations_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_revenue_id_revenues_id_fk` FOREIGN KEY (`revenue_id`) REFERENCES `revenues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_expense_id_expenses_id_fk` FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_tax_id_taxes_id_fk` FOREIGN KEY (`tax_id`) REFERENCES `taxes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revenues` ADD CONSTRAINT `revenues_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revenues` ADD CONSTRAINT `revenues_subscription_id_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_video_progress` ADD CONSTRAINT `user_video_progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_video_progress` ADD CONSTRAINT `user_video_progress_video_scene_id_video_scenes_id_fk` FOREIGN KEY (`video_scene_id`) REFERENCES `video_scenes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_scenes` ADD CONSTRAINT `video_scenes_language_id_languages_id_fk` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `virtual_teachers` ADD CONSTRAINT `virtual_teachers_language_id_languages_id_fk` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE no action ON UPDATE no action;