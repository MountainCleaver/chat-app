-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2025 at 04:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chat_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `contact_rels`
--

CREATE TABLE `contact_rels` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `time_stamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','accepted') DEFAULT 'pending',
  `last_interaction` timestamp NULL DEFAULT NULL,
  `user_min` int(11) GENERATED ALWAYS AS (least(`user_id`,`contact_id`)) VIRTUAL,
  `user_max` int(11) GENERATED ALWAYS AS (greatest(`user_id`,`contact_id`)) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_rels`
--

INSERT INTO `contact_rels` (`id`, `user_id`, `contact_id`, `time_stamp`, `status`, `last_interaction`) VALUES
(1, 1, 2, '2025-07-10 07:20:04', 'accepted', '2025-07-21 10:05:46'),
(3, 3, 1, '2025-07-10 07:39:46', 'accepted', '2025-07-10 14:00:04'),
(4, 2, 4, '2025-07-21 10:05:31', 'pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `chatroom_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `sender` int(11) DEFAULT NULL,
  `receiver` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_receipt` enum('unread','read') DEFAULT 'unread'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `chatroom_id`, `message`, `sender`, `receiver`, `timestamp`, `read_receipt`) VALUES
(1, 1, 'helo', 1, 2, '2025-07-10 07:20:23', 'read'),
(2, 1, 'hoi', 2, 1, '2025-07-10 07:20:30', 'read'),
(3, 1, 'bogok ka ba', 1, 2, '2025-07-10 07:20:41', 'read'),
(4, 1, 'ha', 1, 2, '2025-07-10 07:20:42', 'read'),
(8, 1, 'jorji@gmail.com', 2, 1, '2025-07-10 11:46:14', 'read'),
(9, 1, 'hi', 2, 1, '2025-07-10 11:46:50', 'read'),
(10, 3, 'asdf', 1, 3, '2025-07-10 11:46:55', 'read'),
(11, 1, 'asdf', 1, 2, '2025-07-10 11:47:01', 'read'),
(12, 3, 'asdf', 1, 3, '2025-07-10 11:47:22', 'read'),
(13, 1, 'hi', 2, 1, '2025-07-10 11:47:47', 'read'),
(14, 1, 'hi', 2, 1, '2025-07-10 11:48:02', 'read'),
(15, 3, 'sdfg', 1, 3, '2025-07-10 11:48:05', 'read'),
(16, 1, 'hi', 2, 1, '2025-07-10 11:48:07', 'read'),
(17, 3, 'asdfadsf', 1, 3, '2025-07-10 11:48:10', 'read'),
(18, 3, 'asdf', 1, 3, '2025-07-10 11:48:16', 'read'),
(19, 1, 'dsafg', 2, 1, '2025-07-10 11:48:17', 'read'),
(20, 1, 'asdf', 2, 1, '2025-07-10 11:50:08', 'read'),
(21, 1, 'asdf', 2, 1, '2025-07-10 11:52:43', 'read'),
(22, 3, 'asdfsf', 1, 3, '2025-07-10 11:52:48', 'read'),
(23, 1, 'asdf', 2, 1, '2025-07-10 11:52:52', 'read'),
(24, 1, 'asdfs', 1, 2, '2025-07-10 11:53:05', 'read'),
(25, 1, 'asdf', 2, 1, '2025-07-10 11:53:14', 'read'),
(27, 1, 'hi jorji', 1, 2, '2025-07-10 11:54:13', 'read'),
(28, 1, 'asdf', 2, 1, '2025-07-10 12:14:21', 'read'),
(29, 1, 'helo jorji', 1, 2, '2025-07-10 12:14:35', 'read'),
(30, 1, 'helo moka', 2, 1, '2025-07-10 12:23:04', 'read'),
(31, 1, 'helo moka', 2, 1, '2025-07-10 12:24:54', 'read'),
(32, 1, 'hi jorji', 1, 2, '2025-07-10 12:25:07', 'read'),
(34, 1, 'hi moka', 2, 1, '2025-07-10 12:25:32', 'read'),
(35, 1, 'helo moka again', 2, 1, '2025-07-10 12:26:37', 'read'),
(36, 1, 'helo jorji', 1, 2, '2025-07-10 12:26:51', 'read'),
(37, 1, 'helo moka', 2, 1, '2025-07-10 12:27:01', 'read'),
(38, 3, 'hi hapi', 1, 3, '2025-07-10 12:28:01', 'read'),
(39, 1, 'wasup', 1, 2, '2025-07-10 12:36:23', 'read'),
(40, 1, 'helo moka', 2, 1, '2025-07-10 12:36:34', 'read'),
(41, 1, 'helo jorjiiii', 1, 2, '2025-07-10 12:38:38', 'read'),
(42, 1, 'you have a new message this means you miust not be the one selected', 2, 1, '2025-07-10 12:38:58', 'read'),
(43, 1, 'asdfadsf', 1, 2, '2025-07-10 12:44:33', 'read'),
(44, 1, 'helo moka', 2, 1, '2025-07-10 12:47:31', 'read'),
(45, 1, 'asdfasdf', 2, 1, '2025-07-10 12:47:47', 'read'),
(46, 1, 'asd', 2, 1, '2025-07-10 13:09:29', 'read'),
(47, 1, 'asdf', 2, 1, '2025-07-10 13:09:35', 'read'),
(48, 1, 'asdf', 1, 2, '2025-07-10 13:09:45', 'read'),
(49, 1, 'asdfasdf', 1, 2, '2025-07-10 13:10:56', 'read'),
(50, 1, 'moka', 2, 1, '2025-07-10 13:28:49', 'read'),
(51, 1, 'unread message', 2, 1, '2025-07-10 13:29:06', 'read'),
(52, 1, 'sup', 2, 1, '2025-07-10 13:29:53', 'read'),
(53, 1, 'sup', 2, 1, '2025-07-10 13:30:03', 'read'),
(54, 1, 'unread', 1, 2, '2025-07-10 13:30:15', 'read'),
(55, 3, 'hoi', 1, 3, '2025-07-10 13:30:22', 'read'),
(57, 1, 'oi', 1, 2, '2025-07-10 13:31:29', 'read'),
(58, 3, 'bobo ka ba', 3, 1, '2025-07-10 13:40:22', 'read'),
(59, 3, 'hindi po', 1, 3, '2025-07-10 13:40:28', 'read'),
(60, 3, 'okay', 3, 1, '2025-07-10 13:40:37', 'read'),
(61, 3, 'okay', 1, 3, '2025-07-10 13:40:40', 'read'),
(62, 3, 'dsfg', 1, 3, '2025-07-10 13:43:26', 'read'),
(63, 3, 'sdfg', 1, 3, '2025-07-10 13:43:27', 'read'),
(64, 3, 'fgd', 1, 3, '2025-07-10 13:46:13', 'read'),
(65, 3, 'sadf', 1, 3, '2025-07-10 13:46:18', 'read'),
(66, 3, 'sdfg', 1, 3, '2025-07-10 13:48:37', 'read'),
(67, 3, 'asdf', 1, 3, '2025-07-10 13:48:42', 'read'),
(68, 3, 'dfgh', 1, 3, '2025-07-10 13:48:55', 'read'),
(69, 3, 'asdf', 1, 3, '2025-07-10 13:49:09', 'read'),
(70, 3, 'asdf', 1, 3, '2025-07-10 13:50:11', 'read'),
(71, 3, 'asdf', 1, 3, '2025-07-10 13:50:47', 'read'),
(72, 3, 'bnew', 1, 3, '2025-07-10 13:50:49', 'read'),
(73, 3, 'asdf', 1, 3, '2025-07-10 13:52:18', 'read'),
(74, 3, 'helo', 3, 1, '2025-07-10 13:52:38', 'read'),
(75, 3, 'oi', 3, 1, '2025-07-10 13:52:58', 'read'),
(76, 3, 'helo', 1, 3, '2025-07-10 13:54:44', 'read'),
(77, 3, 'oi', 1, 3, '2025-07-10 13:56:00', 'read'),
(78, 3, 'h', 1, 3, '2025-07-10 13:56:38', 'read'),
(79, 3, 'oi', 1, 3, '2025-07-10 13:57:51', 'read'),
(80, 3, 'oi', 1, 3, '2025-07-10 13:57:56', 'read'),
(81, 3, 'is this read', 1, 3, '2025-07-10 13:58:02', 'read'),
(82, 3, 'if this', 1, 3, '2025-07-10 13:58:13', 'read'),
(84, 3, 'oi', 1, 3, '2025-07-10 13:58:24', 'read'),
(85, 3, 'bobo ka ba', 1, 3, '2025-07-10 13:59:33', 'read'),
(86, 1, 'ikaw dinbobo ka ba', 1, 2, '2025-07-10 13:59:39', 'read'),
(87, 3, 'hindi po', 3, 1, '2025-07-10 13:59:43', 'read'),
(88, 3, 'weh ba', 1, 3, '2025-07-10 13:59:49', 'read'),
(89, 3, 'oi', 3, 1, '2025-07-10 14:00:04', 'read'),
(91, 1, 'bogok', 2, 1, '2025-07-11 12:45:15', 'read'),
(107, 1, 'asdf', 2, 1, '2025-07-12 11:24:41', 'read'),
(108, 1, 'asdfsadf', 2, 1, '2025-07-12 11:24:45', 'read'),
(109, 1, 'asdf', 2, 1, '2025-07-12 11:24:49', 'read'),
(110, 1, 'max-width: 65%;    padding: 0.6rem 1rem;    font-size: 0.9rem;    word-wrap: break-word;    overflow-wrap: break-word;    white-space: normal;    border-radius: 10px;    color: var(--color-bg);}.sender {    justify-content: flex-end;    align-self: flex-end;    background-color: var(--color-accent);    border-radius: 10px 10px 0px 10px;}.receiver {    justify-content: flex-start;    align-self: flex-start;    background-color: var(--color-link);    border-radius: 0px 10px 10px 10px;', 1, 2, '2025-07-12 11:55:14', 'read'),
(111, 1, 'asdf', 1, 2, '2025-07-12 11:57:13', 'read'),
(112, 1, 'asdf\\', 1, 2, '2025-07-12 11:57:21', 'read'),
(113, 1, 'asdf', 2, 1, '2025-07-12 11:57:56', 'read'),
(114, 1, 'asdf', 2, 1, '2025-07-12 11:58:03', 'read'),
(115, 1, 'asdf', 2, 1, '2025-07-12 11:58:33', 'read'),
(116, 1, 'asdf', 2, 1, '2025-07-12 11:59:09', 'read'),
(117, 1, 'asdf', 1, 2, '2025-07-12 11:59:23', 'read'),
(118, 1, 'asdf', 1, 2, '2025-07-12 11:59:47', 'read'),
(119, 1, 'sadf', 1, 2, '2025-07-12 11:59:57', 'read'),
(120, 1, 'asdfasdf', 1, 2, '2025-07-12 12:00:06', 'read'),
(121, 1, 'asdf', 1, 2, '2025-07-12 12:00:15', 'read'),
(122, 1, 'new message', 1, 2, '2025-07-12 12:00:21', 'read'),
(123, 1, 'asdf]', 1, 2, '2025-07-12 12:03:24', 'read'),
(124, 1, 'sadf', 1, 2, '2025-07-12 12:21:19', 'read'),
(125, 1, 'asdf', 1, 2, '2025-07-12 12:21:47', 'read'),
(126, 1, 'new message', 2, 1, '2025-07-12 12:21:54', 'read'),
(127, 1, 'new message', 1, 2, '2025-07-12 12:25:11', 'read'),
(128, 1, 'asdf', 2, 1, '2025-07-12 12:26:27', 'read'),
(129, 1, 'ASDF', 1, 2, '2025-07-12 12:29:58', 'read'),
(130, 1, 'SDFG', 1, 2, '2025-07-12 12:29:59', 'read'),
(131, 1, 'ASD', 1, 2, '2025-07-12 12:30:07', 'read'),
(132, 1, 'SDGF', 1, 2, '2025-07-12 12:30:07', 'read'),
(133, 1, 'vghj', 2, 1, '2025-07-12 12:34:08', 'read'),
(134, 1, 'asdf', 2, 1, '2025-07-12 12:35:33', 'read'),
(135, 1, 'asdasd', 2, 1, '2025-07-12 12:37:57', 'unread'),
(136, 1, 'asdfasdf', 2, 1, '2025-07-12 12:37:57', 'unread'),
(137, 1, 'asdf', 2, 1, '2025-07-12 12:37:59', 'unread'),
(138, 1, 'asfasdfasdfsdaf', 2, 1, '2025-07-12 12:38:40', 'unread'),
(139, 1, 'sadddddddddddddddddddddddddd', 2, 1, '2025-07-12 12:38:42', 'unread'),
(144, 1, 'asdf', 2, 1, '2025-07-21 10:05:44', 'unread'),
(145, 1, 'asdf', 2, 1, '2025-07-21 10:05:46', 'unread');

--
-- Triggers `messages`
--
DELIMITER $$
CREATE TRIGGER `update_last_interaction` AFTER INSERT ON `messages` FOR EACH ROW BEGIN
  UPDATE contact_rels
  SET last_interaction = NEW.timestamp
  WHERE id = NEW.chatroom_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(90) NOT NULL,
  `username` varchar(90) NOT NULL,
  `password` varchar(90) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_int_wth` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `created_at`, `last_int_wth`) VALUES
(1, 'moka@gmail.com', 'Moka', '$2y$10$MFRqjt1DMwBDHJshZmQZr.NnzfYqGP306I9E.1Ha/cMdnUObOWlpG', '2025-07-10 07:19:00', 2),
(2, 'jorji@gmail.com', 'jorji', '$2y$10$S86AYGQWXaTyretJrP8qlub1Eu/VYYFPHpSk5D2wR8iheh6KKgcJG', '2025-07-10 07:19:52', 1),
(3, 'hapi@gmail.com', 'hapi', '$2y$10$WsCLbBwjA6qEi2fGJywnZurDDXPdH.DU41JazhWTXlukd/7BBFm.C', '2025-07-10 07:39:16', 2),
(4, 'hana@gmail.com', 'hana', '$2y$10$x3Eu5zZrvyZmg6YxvCFjEO97Xc2TWvSpj8THFKc4TdPISZPySnurC', '2025-07-12 11:17:46', NULL),
(5, 'julius@gmail.com', 'Julius', '$2y$10$fbAbmz1eV2.J5aJcpTNemOnjWpi1LucnFRYiQTzZWUXT3ni5qg0bq', '2025-08-20 08:57:49', NULL),
(6, 'dave@gmail.com', 'Dave', '$2y$10$qJI2NA2uXpDanVFCf8tcKeAYDkuBXSMEhySmTl4K82DwdUa3e/mlS', '2025-09-16 14:36:42', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contact_rels`
--
ALTER TABLE `contact_rels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_contact_pair` (`user_min`,`user_max`),
  ADD KEY `fk_user` (`user_id`),
  ADD KEY `fk_contact` (`contact_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_ibfk_1` (`chatroom_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `fk_last_interaction` (`last_int_wth`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_rels`
--
ALTER TABLE `contact_rels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contact_rels`
--
ALTER TABLE `contact_rels`
  ADD CONSTRAINT `fk_contact` FOREIGN KEY (`contact_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chatroom_id`) REFERENCES `contact_rels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_last_interaction` FOREIGN KEY (`last_int_wth`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
