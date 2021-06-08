USE db;

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Table `node`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `node` (
  `public_key` VARCHAR(80) NOT NULL,
  `IP` VARCHAR(45) NULL,
  `rippled_version` VARCHAR(45) NULL,
  `uptime` INT NULL,
  `port` VARCHAR(7) NULL,
  `ports` VARCHAR(3000) NULL,
  `protocols` VARCHAR(3000) NULL,
  `publisher` VARCHAR(80) NULL,
  `longtitude` DOUBLE NULL,
  `latitude` DOUBLE NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`public_key`),
  UNIQUE INDEX `public_key_UNIQUE` (`public_key` ASC) VISIBLE)


ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `validator`
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
-- -----------------------------------------------------
USE db;
CREATE TABLE IF NOT EXISTS `connection` (
  `connection_id` INT NOT NULL AUTO_INCREMENT,
  `start_node` VARCHAR(80) NOT NULL,
  `end_node` VARCHAR(80) NOT NULL,
PRIMARY KEY (`start_node`, `end_node`),
  UNIQUE INDEX `connection_id_UNIQUE` (`connection_id` ASC) VISIBLE,
  FOREIGN KEY (`start_node`)
    REFERENCES `node` (`public_key`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (`end_node`)
    REFERENCES `node` (`public_key`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `node-validator`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `node_validator` (
  `node_key` VARCHAR(80) NOT NULL,
  `validator_key` VARCHAR(80) NOT NULL,

  FOREIGN KEY (`node_key`)
    REFERENCES `node` (`public_key`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (`validator_key`)
    REFERENCES `validator` (`public_key`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)

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
    `id` INT NOT NULL AUTO_INCREMENT,
    `public_key` VARCHAR(80) NOT NULL,
    `total` INT NOT NULL,                           -- total validated ledgers
    `missed` INT NOT NULL,                          -- missed validated ledgers
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
