-- BBUC Fresh Graduates Job Platform Database Schema
-- Standard SQLite format

CREATE TABLE admins (
    admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin'
);

CREATE TABLE employers (
    employer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE graduates (
    graduate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_number VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    course VARCHAR(255) NOT NULL,
    skills TEXT,
    cv_file VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    deadline DATE,
    employer_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(employer_id) ON DELETE CASCADE
);

CREATE TABLE applications (
    application_id INTEGER PRIMARY KEY AUTOINCREMENT,
    graduate_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    date_applied DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (graduate_id) REFERENCES graduates(graduate_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    UNIQUE (graduate_id, job_id)
);
