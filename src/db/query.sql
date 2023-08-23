-- Create Database: CREATE DATABASE risevest;
-- Connect to database: \c risevest;
-- create user table: CREATE TABLE users(
--     id SERIAL PRIMARY KEY NOT NULL,
--     fullname VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE users(
--     id SERIAL PRIMARY KEY NOT NULL,
--     fullname VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255)
-- );

-- create user folder: 
CREATE TABLE folders(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER,
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
	      REFERENCES users(id)
);

 --NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

--list all tables: \d;
