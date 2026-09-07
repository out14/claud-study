CREATE DATABASE IF NOT EXISTS claude_study
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE claude_study;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  joined_at DATE NOT NULL,
  avatar_url LONGTEXT NULL,
  refresh_token_hash VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(30) PRIMARY KEY,
  category ENUM('news', 'chat', 'promo') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at DATE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  thumbnail_url LONGTEXT NULL,
  detail_image_urls LONGTEXT NULL,
  origin VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  manufactured_at DATE NOT NULL,
  expires_at DATE NOT NULL,
  price_1 INT UNSIGNED NOT NULL,
  price_10 INT UNSIGNED NOT NULL,
  price_50 INT UNSIGNED NOT NULL,
  price_100 INT UNSIGNED NOT NULL,
  visibility ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
  created_at DATE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(30) PRIMARY KEY,
  product_id VARCHAR(30) NOT NULL,
  author VARCHAR(100) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  status ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
  created_at DATE NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(30) PRIMARY KEY,
  product_id VARCHAR(30) NOT NULL,
  author VARCHAR(100) NOT NULL,
  is_secret TINYINT(1) NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  answer_content TEXT NULL,
  created_at DATE NOT NULL,
  answered_at DATE NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;
