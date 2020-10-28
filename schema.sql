-- DROP AND CREATE EMPLOYEE_INFO_DB
DROP DATABASE IF EXISTS employee_info_db;
CREATE database employee_info_db;

-- CREATE TABLES WITHIN DATABASE
USE employee_info_db;

-- CREATE EMPLOYEE TABLE
CREATE TABLE employee (
	id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT NOT NULL,
	PRIMARY KEY (id)
);

-- CREATE ROLE TABLE
CREATE TABLE role (
	id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL (12, 2) NULL,
    department_id INT NOT NULL,
	PRIMARY KEY (id)
);

-- CREATE DEPARTMENT TABLE
CREATE TABLE department (
	id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30),
	PRIMARY KEY (id)
    );


-- SEEDS FOR DATABASE
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Sean", "Kirkpatrick", 1, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Smith", 4, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Marisa", "Rovereto", 2, 1);

INSERT INTO role (title, salary, department_id)
VALUES ("Software Engineer", 100000.00, 1);

INSERT INTO role (title, salary, department_id)
VALUES ("Software Tester", 85000.00, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Accountant", 90000.00, 3);

INSERT INTO role (title, salary, department_id)
VALUES ("Marketer", 75000.00, 4);

INSERT INTO role (title, salary, department_id)
VALUES ("C-Suite", 500000.00, 5);


INSERT INTO department (name)
VALUES ("Develoupment");

INSERT INTO department (name)
VALUES ("Testing");

INSERT INTO department (name)
VALUES ("Finance");

INSERT INTO department (name)
VALUES ("Marketing");

INSERT INTO department (name)
VALUES ("C-Suite");
