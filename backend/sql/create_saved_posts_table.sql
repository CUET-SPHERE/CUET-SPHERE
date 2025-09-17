-- Create saved_posts table for user bookmarks/saved posts functionality
-- This table creates a many-to-many relationship between users and posts

CREATE TABLE saved_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Ensure a user can't save the same post multiple times
    UNIQUE KEY unique_user_post (user_id, post_id)
);

-- Indexes for optimal query performance

-- For quickly finding all posts saved by a user
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);

-- For quickly checking if a specific post is saved by a user
CREATE INDEX idx_saved_posts_user_post ON saved_posts(user_id, post_id);

-- For getting save count per post (if needed for analytics)
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);

-- For ordering saved posts by save date
CREATE INDEX idx_saved_posts_saved_at ON saved_posts(saved_at);

-- Composite index for efficient pagination of user's saved posts
CREATE INDEX idx_saved_posts_user_saved_at ON saved_posts(user_id, saved_at DESC);