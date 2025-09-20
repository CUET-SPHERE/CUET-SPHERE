CREATE TABLE IF NOT EXISTS current_semester (
  semester_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  semester_name VARCHAR(50) NOT NULL,
  dept_id BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Index for faster lookups
CREATE INDEX idx_semester_department ON current_semester(dept_id);
CREATE INDEX idx_semester_active ON current_semester(is_active);