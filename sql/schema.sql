-- -- CREATE DATABASE IF NOT EXISTS bdgusdtmining;
-- -- USE bdgusdtmining;

-- -- ALTER TABLE users 

-- --   ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) DEFAULT 0 AFTER created_at;
-- --   UPDATE users SET is_admin = 1 WHERE email = 'anshubaniya247@gmail.com';
  
-- -- CREATE TABLE IF NOT EXISTS users (
-- --     id INT AUTO_INCREMENT PRIMARY KEY,
-- --     name VARCHAR(100),
-- --     email VARCHAR(150) UNIQUE,
-- --     password_hash VARCHAR(255),
-- --     invite_code VARCHAR(30) UNIQUE,
-- --     inviter_id INT,
-- --     level INT DEFAULT 1,
-- --     recharge_count INT DEFAULT 0,
-- --     balance DECIMAL(12,2) DEFAULT 0,
-- --     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- --     FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL
-- -- );

-- -- CREATE TABLE IF NOT EXISTS transactions (
-- --     id INT AUTO_INCREMENT PRIMARY KEY,
-- --     transaction_id VARCHAR(80) UNIQUE,
-- --     user_id INT,
-- --     type ENUM('recharge','withdrawal','bonus') NOT NULL,
-- --     amount DECIMAL(12,2),
-- --     status ENUM('pending','confirmed','failed') DEFAULT 'pending',
-- --     metadata TEXT,
-- --     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- --     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- -- );

-- -- CREATE TABLE IF NOT EXISTS tasks (
-- --     id INT AUTO_INCREMENT PRIMARY KEY,
-- --     user_id INT,
-- --     task_name VARCHAR(80),
-- --     completed_at TIMESTAMP,
-- --     reward DECIMAL(12,2),
-- --     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- --     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- -- );

-- -- CREATE TABLE IF NOT EXISTS invites (
-- --     id INT AUTO_INCREMENT PRIMARY KEY,
-- --     inviter_id INT,
-- --     invitee_id INT,
-- --     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- --     FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
-- --     FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
-- -- );






-- -- Create DB
-- CREATE DATABASE IF NOT EXISTS bdgusdtmining;
-- USE bdgusdtmining;

-- -- USERS TABLE
-- CREATE TABLE IF NOT EXISTS users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100),
--     email VARCHAR(150) UNIQUE,
--     password_hash VARCHAR(255),
--     invite_code VARCHAR(30) UNIQUE,
--     inviter_id INT DEFAULT NULL,
--     level INT DEFAULT 1,
--     recharge_count INT DEFAULT 0,
--     balance DECIMAL(12,2) DEFAULT 0,
--     active_plan INT DEFAULT NULL,
--     last_task_date DATE DEFAULT NULL,
--     is_admin TINYINT(1) DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL
-- );

-- -- Make your email admin
-- -- UPDATE users SET is_admin = 1 WHERE email = 'anshubaniya247@gmail.com';

-- -- TRANSACTIONS TABLE
-- CREATE TABLE IF NOT EXISTS transactions (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     transaction_id VARCHAR(80) UNIQUE,
--     user_id INT,
--     type ENUM('recharge','withdrawal','bonus') NOT NULL,
--     amount DECIMAL(12,2),
--     status ENUM('pending','confirmed','failed') DEFAULT 'pending',
--     metadata TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- TASK LOGS TABLE (for daily activity)
-- CREATE TABLE IF NOT EXISTS tasks (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     task_name VARCHAR(80),
--     completed_at TIMESTAMP,
--     reward DECIMAL(12,2),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- INVITES TABLE
-- CREATE TABLE IF NOT EXISTS invites (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     inviter_id INT,
--     invitee_id INT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- USER TASK PURCHASE TABLE
-- CREATE TABLE IF NOT EXISTS user_tasks (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     amount DECIMAL(10,2) NOT NULL,
--     last_claim DATETIME NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );


-- CREATE TABLE IF NOT EXISTS recharge_orders (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT,
--   amount DECIMAL(10,2),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS task_orders (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT,
--   amount DECIMAL(10,2),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- -- PLANS TABLE
-- CREATE TABLE IF NOT EXISTS plans (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   amount INT NOT NULL,
--   daily_reward INT NOT NULL
-- );


-- CREATE TABLE IF NOT EXISTS transactions (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   transaction_id VARCHAR(80) UNIQUE,
--   user_id INT,
--   type ENUM('recharge','withdrawal','bonus') NOT NULL,
--   amount DECIMAL(12,2),
--   status ENUM('pending','confirmed','failed') DEFAULT 'pending',
--   metadata TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- -- Insert plans only if table empty
-- INSERT INTO plans (amount, daily_reward)
-- SELECT * FROM (SELECT 25,0.5 UNION SELECT 100,2 UNION SELECT 300,6 UNION
-- SELECT 720,14.40 UNION SELECT 1750,35 UNION SELECT 4080,81.60 UNION SELECT 10000,200 UNION
-- SELECT 25000,500 UNION SELECT 65000,1300 UNION SELECT 115000,2300) AS tmp
-- WHERE NOT EXISTS (SELECT 1 FROM plans);


















CREATE DATABASE IF NOT EXISTS bdgusdtmining;
USE bdgusdtmining;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    invite_code VARCHAR(30) UNIQUE,
    inviter_id INT DEFAULT NULL,
    level INT DEFAULT 1,
    recharge_count INT DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    active_plan INT DEFAULT NULL,
    last_task_date DATE DEFAULT NULL,
    bonus_given TINYINT(1) DEFAULT 0,     -- ⭐ BONUS ONLY ONE TIME
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(80) UNIQUE,
    user_id INT,
    type ENUM('recharge','withdrawal','bonus') NOT NULL,
    amount DECIMAL(12,2),
    status ENUM('pending','confirmed','failed') DEFAULT 'pending',
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    task_name VARCHAR(80),
    completed_at TIMESTAMP,
    reward DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INVITES TABLE
CREATE TABLE IF NOT EXISTS invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inviter_id INT,
    invitee_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- USER TASK PURCHASE TABLE
CREATE TABLE IF NOT EXISTS user_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    last_claim DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- RECHARGE ORDERS
CREATE TABLE IF NOT EXISTS recharge_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TASK ORDERS
CREATE TABLE IF NOT EXISTS task_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  daily_reward DECIMAL(12,2) NOT NULL
);

-- Insert investment plans only if empty
INSERT INTO plans (amount, daily_reward)
SELECT * FROM (
    SELECT 25, 0.5
    UNION SELECT 100, 2
    UNION SELECT 300, 6
    UNION SELECT 720, 14.40
    UNION SELECT 1750, 35
    UNION SELECT 4080, 81.60
    UNION SELECT 10000, 200
    UNION SELECT 25000, 500
    UNION SELECT 65000, 1300
    UNION SELECT 115000, 2300
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM plans);

