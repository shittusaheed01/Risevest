-- Create Database: 
    CREATE DATABASE risevest;
-- Connect to database: 
    \c risevest;
-- Drop Database:
    DROP DATABASE risevest;

--create role enum:
CREATE TYPE ROLE_ENUM AS ENUM ('user', 'admin');

-- create user db:
CREATE TABLE users(
    id SERIAL PRIMARY KEY NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ROLE_ENUM DEFAULT 'user',
    password VARCHAR(255)
);

--drop users db:
DROP TABLE users;

-- create folder db: 
CREATE TABLE folders(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER,
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
	      REFERENCES users(id)
);

--drop folder db:
DROP TABLE folders;

-- create file db: 
CREATE TABLE files(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    ext VARCHAR(255) NOT NULL,
    unsafe BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    folder_id INTEGER,
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
	      REFERENCES users(id),
      FOREIGN KEY (folder_id) REFERENCES folders(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

--drop file db:
DROP TABLE files;

