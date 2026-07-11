-- DML: insert row
INSERT INTO parents (first_name, last_name) VALUES ("Ah kow", "Tan");

-- DML: insert a row with foreign key dependency
INSERT INTO students (parent_id, first_name, last_name, dob, swimming_level)
VALUES (1, "Ah Mew", "Tan", "2020-06-09", 1);

-- Inset multiple rows at the same time
INSERT INTO parents (first_name, last_name) VALUES ("Jon", "Snow"), ("Adam", "Smith"), ("Tony", "Stare");

-- Update a table
-- UPDATE <name of table> SET <col1>=<value1>, <col2>=<value2>.... WHERE <cond>
UPDATE parents SET first_name="JOHN" WHERE parent_id = 3;

-- DELETE FROM <parents> WHERE <cond>
DELETE FROM parents WHERE parent_id = 3;