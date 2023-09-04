-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: wiki
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action_log`
--

DROP TABLE IF EXISTS `action_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action_log` (
  `cod` int NOT NULL AUTO_INCREMENT,
  `user` varchar(30) NOT NULL,
  `description` varchar(500) NOT NULL,
  `date` date NOT NULL,
  `action` int NOT NULL,
  PRIMARY KEY (`cod`),
  KEY `FK_User_idx` (`user`),
  KEY `FK_Action_idx` (`action`),
  CONSTRAINT `FK_Action` FOREIGN KEY (`action`) REFERENCES `action` (`cod`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_User` FOREIGN KEY (`user`) REFERENCES `user` (`user_cod`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_log`
--

LOCK TABLES `action_log` WRITE;
/*!40000 ALTER TABLE `action_log` DISABLE KEYS */;
INSERT INTO `action_log` VALUES (1,'irojas','login','2023-06-26',4),(5,'irojas','Inicio de sesión de usuario','2023-06-27',4),(6,'irojas','Inicio de sesión de usuario','2023-06-28',4),(7,'irojas','Inicio de sesión de usuario','2023-06-28',4),(8,'irojas','Inicio de sesión de usuario','2023-06-28',4),(9,'irojas','Inicio de sesión de usuario','2023-06-28',4),(10,'rnunez','Inicio de sesión de usuario','2023-06-28',4),(11,'irojas','Inicio de sesión de usuario','2023-06-28',4),(12,'irojas','Inicio de sesión de usuario','2023-06-28',4),(13,'irojas','Inicio de sesión de usuario','2023-07-10',4),(14,'irojas','Inicio de sesión de usuario','2023-07-23',4),(15,'irojas','Inicio de sesión de usuario','2023-07-23',4),(16,'irojas','Inicio de sesión de usuario','2023-07-23',4),(17,'irojas','Inicio de sesión de usuario','2023-08-17',4),(18,'irojas','Inicio de sesión de usuario','2023-08-17',4),(19,'irojas','Inicio de sesión de usuario','2023-08-17',4),(20,'irojas','Inicio de sesión de usuario','2023-08-18',4),(21,'irojas','Inicio de sesión de usuario','2023-08-18',4),(22,'irojas','Inicio de sesión de usuario','2023-08-18',4),(23,'irojas','Inicio de sesión de usuario','2023-08-18',4),(24,'irojas','Inicio de sesión de usuario','2023-08-18',4),(25,'irojas','Inicio de sesión de usuario','2023-08-18',4),(26,'irojas','Inicio de sesión de usuario','2023-08-18',4),(27,'irojas','Inicio de sesión de usuario','2023-08-18',4),(28,'irojas','Inicio de sesión de usuario','2023-08-18',4),(29,'irojas','Inicio de sesión de usuario','2023-08-18',4),(30,'irojas','Inicio de sesión de usuario','2023-08-18',4),(31,'irojas','Inicio de sesión de usuario','2023-08-18',4),(32,'irojas','Inicio de sesión de usuario','2023-08-18',4),(33,'irojas','Inicio de sesión de usuario','2023-08-18',4),(34,'irojas','Inicio de sesión de usuario','2023-08-18',4),(35,'irojas','Inicio de sesión de usuario','2023-08-18',4),(36,'irojas','Inicio de sesión de usuario','2023-08-18',4),(37,'irojas','Inicio de sesión de usuario','2023-08-18',4),(38,'irojas','Inicio de sesión de usuario','2023-08-21',4),(39,'irojas','Inicio de sesión de usuario','2023-08-21',4),(40,'irojas','Inicio de sesión de usuario','2023-08-21',4),(41,'irojas','Inicio de sesión de usuario','2023-08-21',4),(42,'irojas','Inicio de sesión de usuario','2023-08-21',4),(43,'irojas','Inicio de sesión de usuario','2023-08-21',4),(44,'irojas','Inicio de sesión de usuario','2023-08-21',4),(45,'irojas','Inicio de sesión de usuario','2023-08-21',4),(46,'irojas','Inicio de sesión de usuario','2023-08-21',4),(47,'irojas','Inicio de sesión de usuario','2023-08-21',4),(48,'irojas','Inicio de sesión de usuario','2023-08-21',4),(49,'irojas','Inicio de sesión de usuario','2023-08-21',4),(50,'irojas','Inicio de sesión de usuario','2023-08-28',4),(51,'irojas','Inicio de sesión de usuario','2023-08-28',4),(52,'irojas','Inicio de sesión de usuario','2023-08-28',4),(53,'ksalazar','Inicio de sesión de usuario','2023-08-28',4),(54,'ksalazar','Inicio de sesión de usuario','2023-08-29',4),(55,'ksalazar','Inicio de sesión de usuario','2023-08-31',4),(56,'ksalazar','Inicio de sesión de usuario','2023-08-31',4),(57,'ksalazar','Inicio de sesión de usuario','2023-08-31',4),(58,'ksalazar','Inicio de sesión de usuario','2023-09-04',4);
/*!40000 ALTER TABLE `action_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-04  9:46:24
