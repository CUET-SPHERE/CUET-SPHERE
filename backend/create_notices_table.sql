-- Create notices table if it doesn't exist
CREATE TABLE IF NOT EXISTS notices (
    notice_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    N_department VARCHAR(255) NOT NULL,
    N_batch VARCHAR(255) NOT NULL,
    N_title VARCHAR(255) NOT NULL,
    N_message TEXT NOT NULL,
    N_attachment VARCHAR(500),
    N_notice_type VARCHAR(50),
    N_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    N_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sender_id BIGINT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notices_batch_dept ON notices(N_batch, N_department);
CREATE INDEX IF NOT EXISTS idx_notices_sender ON notices(sender_id);
CREATE INDEX IF NOT EXISTS idx_notices_created ON notices(N_created_at);
