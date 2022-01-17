CREATE TABLE IF NOT EXISTS `feeds` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `chat_id` int(100) NOT NULL,
  `from_id` int(100) NOT NULL,
  `feed_type` enum('youtube','site') NOT NULL,
  `feed_url` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;