-- Database creation
CREATE DATABASE tree_adoption;

-- Use the Database
USE DATABASE tree_adoption;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create trees table
CREATE TABLE trees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    number INT
);

-- Insert Data into trees table
INSERT INTO trees (name, description) VALUES
    ('Willow Tree', 'Salix', 1),
    ('Birch Tree', 'Betula', 2),
    ('Cedar Tree', 'Cedrus', 4),
    ('Palm Tree', 'Arecaceae', 5),
    ('Cherry Blossom Tree', 'Prunus', 4),
    ('Fir Tree', 'Abies', 3),
    ('Redwood Tree', 'Sequoia', 3),
    ('Holly Tree', 'Ilex', 2),
    ('Dogwood Tree', 'Cornus', 2),
    ('Bamboo Tree', 'Bambusoideae', 1);

-- Create secrets table (to store the jwt tokens)
CREATE TABLE secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    secret_key VARCHAR(255) NOT NULL
);

-- Create tree_adoptions table (to store the tree adoption details of users)
CREATE TABLE tree_adoptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tree_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
);

-- Create produce table (to store produce quantity of each tree)
CREATE TABLE produce (
    produce_id INT PRIMARY KEY AUTO_INCREMENT,
    tree_id INT,
    quantity INT,
    FOREIGN KEY (tree_id) REFERENCES trees(id)
);

-- Insert values into produce table
INSERT INTO produce (tree_id, quantity) VALUES
    (1, 10),
    (2, 15),
    (3, 8),
    (4, 20),
    (5, 12),
    (6, 18),
    (7, 25),
    (8, 14),
    (9, 22),
    (10, 30);

-- Create user_produce_shares table (to store the produce distribution details of users)
CREATE TABLE user_produce_shares (
    share_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    produce_id INT,
    share_quantity INT,
    username VARCHAR(255),
    tree_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (produce_id) REFERENCES produce(produce_id)
);