USE db;

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Table `node`
-- Stores information about each stock node
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `node` (
  `public_key` VARCHAR(80) NOT NULL,
  `IP` VARCHAR(45) NULL,
  `rippled_version` VARCHAR(45) NULL,
  `uptime` INT NULL,
  `portRunningOn` VARCHAR(7) NULL,
  `ports` VARCHAR(3000) NULL,
  `protocols` VARCHAR(3000) NULL,
  `publishers` VARCHAR(800) NULL,
  `longtitude` DOUBLE NULL,
  `latitude` DOUBLE NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`public_key`),
  UNIQUE INDEX `public_key_UNIQUE` (`public_key` ASC) VISIBLE)


ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `validator`
-- Stores information about each validator
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `validator` (
  `public_key` VARCHAR(80) NOT NULL,
  `unl` BOOLEAN NULL DEFAULT FALSE,             -- is the validator part of the official Ripple UNL list
  `missed_ledgers` INT NULL,                    -- number of ledgers not validated for the last 24 hours
  PRIMARY KEY (`public_key`),
  UNIQUE INDEX `public_key_UNIQUE` (`public_key` ASC) VISIBLE)

ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `connection`
-- Stores peer connections between stock nodes
-- -----------------------------------------------------
USE db;
CREATE TABLE IF NOT EXISTS `connection` (
  `start_node` VARCHAR(80) NOT NULL,
  `end_node` VARCHAR(80) NOT NULL,
PRIMARY KEY (`start_node`, `end_node`),
  FOREIGN KEY (`start_node`)
    REFERENCES `node` (`public_key`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`end_node`)
    REFERENCES `node` (`public_key`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `node-validator`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `node_validator` (
  `node_key` VARCHAR(80) NOT NULL,
  `validator_key` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`node_key`, `validator_key`),
    FOREIGN KEY (`node_key`)
      REFERENCES `node` (`public_key`)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    FOREIGN KEY (`validator_key`)
      REFERENCES `validator` (`public_key`)
      ON DELETE CASCADE
      ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `securty_assessment`
-- -----------------------------------------------------
USE db;
CREATE TABLE IF NOT EXISTS `security_assessment` (
  `public_key` VARCHAR(80) NOT NULL,
  `metric_version` FLOAT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `score` FLOAT NOT NULL 
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `validator_assessment`
-- -----------------------------------------------------
USE db;
CREATE TABLE IF NOT EXISTS `validator_assessment` (
  `public_key` VARCHAR(80) NOT NULL,
  `trust_metric_version` FLOAT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `score` FLOAT NOT NULL
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `validator_statistics`
-- It stores hourly statistics about the validator nodes
-- -----------------------------------------------------
USE db;
CREATE TABLE IF NOT EXISTS `validator_statistics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `public_key` VARCHAR(80) NOT NULL,
    `total` INT NOT NULL DEFAULT 0,                           -- total validated ledgers
    `missed` INT NOT NULL DEFAULT 0,                          -- missed validated ledgers
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX (`public_key`),
    FOREIGN KEY (`public_key`)
      REFERENCES `validator` (`public_key`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

DELIMITER $$
CREATE PROCEDURE db.getStatistics()
    BEGIN
        IF (SELECT MAX(DATE(timestamp)) - MIN(DATE(timestamp)) from validator_statistics) < 7
        THEN
            SELECT public_key, GROUP_CONCAT(total) AS total, GROUP_CONCAT(missed) AS missed FROM validator_statistics GROUP BY public_key;
        ELSE
            SELECT public_key, GROUP_CONCAT(total) AS total, GROUP_CONCAT(missed) AS missed FROM (SELECT public_key, SUM(total) AS total, SUM(missed) AS missed FROM validator_statistics GROUP BY public_key, DATE(timestamp)) AS sums GROUP BY public_key;
        END IF;
    END;$$

DELIMITER ;
