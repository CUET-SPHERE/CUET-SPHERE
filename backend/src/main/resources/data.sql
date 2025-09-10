-- Sample users for testing
INSERT INTO users (u_full_name, u_email, u_password, u_hall, u_bio, u_batch, u_department, u_student_id, u_is_active, u_req_user, u_role, u_profile_img_url, u_profile_picture, u_background_image, u_created_at, u_updated_at) VALUES 
('Muhammad Rony', 'rony@student.cuet.ac.bd', '$2a$10$dummyhashedpassword', 'Shaheed Abdur Rab Hall', 'Computer Science student passionate about web development', '22', '04', '005', true, false, 'STUDENT', null, null, null, NOW(), NOW()),
('Fatima Ahmed', 'fatima@student.cuet.ac.bd', '$2a$10$dummyhashedpassword', 'Pritilata Hall', 'Software engineering enthusiast', '22', '04', '010', true, false, 'STUDENT', null, null, null, NOW(), NOW()),
('Karim Hassan', 'karim@student.cuet.ac.bd', '$2a$10$dummyhashedpassword', 'Bangabandhu Hall', 'AI and ML researcher', '21', '04', '025', true, false, 'STUDENT', null, null, null, NOW(), NOW()),
('Nadia Islam', 'nadia@student.cuet.ac.bd', '$2a$10$dummyhashedpassword', 'Pritilata Hall', 'Full-stack developer', '22', '04', '015', true, false, 'CR', null, null, null, NOW(), NOW()),
('Rafiq Khan', 'rafiq@student.cuet.ac.bd', '$2a$10$dummyhashedpassword', 'Shaheed Abdur Rab Hall', 'Cybersecurity specialist', '21', '04', '030', true, false, 'STUDENT', null, null, null, NOW(), NOW())
ON DUPLICATE KEY UPDATE u_full_name = VALUES(u_full_name);

-- Sample posts with proper user IDs
INSERT INTO post (title, content, media_url, created_at, updated_at, user_id) VALUES 
('Welcome to CUET Sphere!', 'This is the first post on our new social platform for CUET students. Feel free to share your thoughts, ask questions, and connect with fellow students!', null, NOW(), NOW(), 1),
('CSE 301 Algorithm Assignment Help', 'Hey everyone! I''m struggling with the dynamic programming problems in our Algorithm assignment. Can anyone help me understand the optimal substructure concept better?', null, NOW(), NOW(), 2),
('Study Group for Database Systems', 'Looking to form a study group for CSE 302 Database Management Systems. We can meet twice a week to discuss concepts and solve problems together. Interested students please comment!', null, NOW(), NOW(), 3),
('Campus Food Review: Cafeteria vs Outside', 'What''s your take on campus food? I''ve been trying different places and wanted to share my experiences. The new cafeteria menu is actually pretty good!', null, NOW(), NOW(), 4),
('Internship Opportunities Discussion', 'Has anyone applied for summer internships yet? I''d love to hear about your experiences and any tips for the application process. Also, which companies are actively recruiting from CUET?', null, NOW(), NOW(), 5)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Sample comments
INSERT INTO comment (text, created_at, updated_at, user_id, post_id) VALUES 
('Great initiative! Looking forward to connecting with more students here.', NOW(), NOW(), 2, 1),
('I can help with DP! Let''s schedule a study session.', NOW(), NOW(), 3, 2),
('Count me in for the database study group!', NOW(), NOW(), 1, 3),
('The new pasta in cafeteria is amazing!', NOW(), NOW(), 5, 4),
('I got an internship at a local tech company. Happy to share my experience!', NOW(), NOW(), 4, 5),
('This platform will be really helpful for academic discussions.', NOW(), NOW(), 4, 1),
('I''m also struggling with the same concepts. Can we form a group?', NOW(), NOW(), 5, 2)
ON DUPLICATE KEY UPDATE text = VALUES(text);

-- Sample votes
INSERT INTO vote (user_id, post_id, upvote, created_at, updated_at) VALUES 
(1, 1, true, NOW(), NOW()),
(2, 1, true, NOW(), NOW()),
(3, 1, true, NOW(), NOW()),
(1, 2, true, NOW(), NOW()),
(4, 2, true, NOW(), NOW()),
(2, 3, true, NOW(), NOW()),
(5, 3, true, NOW(), NOW()),
(1, 4, true, NOW(), NOW()),
(3, 4, false, NOW(), NOW()),
(2, 5, true, NOW(), NOW()),
(4, 5, true, NOW(), NOW()),
(5, 5, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE upvote = VALUES(upvote);

-- Sample post tags
INSERT INTO post_tags (post_id, tag) VALUES 
(1, 'welcome'),
(1, 'introduction'),
(2, 'cse301'),
(2, 'algorithms'),
(2, 'help'),
(3, 'cse302'),
(3, 'database'),
(3, 'study-group'),
(4, 'food'),
(4, 'campus-life'),
(4, 'review'),
(5, 'internship'),
(5, 'career'),
(5, 'opportunities')
ON DUPLICATE KEY UPDATE tag = VALUES(tag);