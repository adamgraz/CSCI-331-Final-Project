-- Sample data so every page has something to show during development.
-- All companies, roles and projects here are made up.

INSERT INTO skills (id, name, have, plan) VALUES
  (1, 'JavaScript', 1, ''),
  (2, 'React', 1, ''),
  (3, 'SQL', 1, ''),
  (4, 'Python', 1, ''),
  (5, 'Java', 0, 'Work through a Spring Boot tutorial'),
  (6, 'Docker', 0, ''),
  (7, 'AWS', 0, ''),
  (8, 'Git', 1, '');

INSERT INTO applications (id, company, role, posting_url, posting_text, stage, notes, created_at) VALUES
  (1, 'Big Sky Software', 'Software Engineering Intern', 'https://example.com/jobs/1',
   'Build web features with JavaScript and React. Experience with SQL and Git is a plus.',
   'Applied', 'Applied through the career fair.', '2026-11-02 09:00:00'),
  (2, 'Gallatin Data Co', 'Data Engineering Intern', 'https://example.com/jobs/2',
   'Write Python and SQL pipelines. Familiarity with Docker and AWS preferred.',
   'Interview', 'First round scheduled.', '2026-11-05 14:30:00'),
  (3, 'Bridger Systems', 'Backend Developer Intern', NULL,
   'Java services running on AWS, deployed with Docker.',
   'Saved', '', '2026-11-12 10:15:00');

INSERT INTO stage_changes (application_id, stage, changed_at) VALUES
  (1, 'Saved', '2026-11-02 09:00:00'),
  (1, 'Applied', '2026-11-03 11:20:00'),
  (2, 'Saved', '2026-11-05 14:30:00'),
  (2, 'Applied', '2026-11-06 08:45:00'),
  (2, 'Interview', '2026-11-14 16:00:00'),
  (3, 'Saved', '2026-11-12 10:15:00');

INSERT INTO application_skills (application_id, skill_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 8),
  (2, 4), (2, 3), (2, 6), (2, 7),
  (3, 5), (3, 7), (3, 6);

INSERT INTO projects (id, name, description, repo_url, source, updated_at) VALUES
  (1, 'Fan Database', 'PHP and MySQL site that stores fans from two APIs.', NULL, 'manual', '2026-10-15'),
  (2, 'Next.js Store', 'React store page that filters products from an API.', NULL, 'manual', '2026-11-16'),
  (3, 'Grade Calculator', 'Python script that totals weighted grades.', NULL, 'manual', '2026-09-20');

INSERT INTO project_skills (project_id, skill_id) VALUES
  (1, 3), (1, 1),
  (2, 1), (2, 2), (2, 8),
  (3, 4);
