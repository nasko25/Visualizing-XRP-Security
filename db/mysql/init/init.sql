
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
  PRIMARY KEY (`connection_id`),
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
-- Table `securty_assessment`
-- -----------------------------------------------------
USE db;
CREATE TABLE IF NOT EXISTS `security_assessment` (
  `public_key` VARCHAR(80) NOT NULL,
  `metric_version` FLOAT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `score` FLOAT NOT NULL 
);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
