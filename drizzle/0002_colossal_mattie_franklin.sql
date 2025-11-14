CREATE TABLE `english_words` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`word` varchar(255) NOT NULL,
	`meaning` text,
	`definition` text,
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`example` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `english_words_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `math_formulas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expression` varchar(500) NOT NULL,
	`type` varchar(100),
	`description` text,
	`color` varchar(50) DEFAULT '#FF6B6B',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `math_formulas_id` PRIMARY KEY(`id`)
);
