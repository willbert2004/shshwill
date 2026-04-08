
INSERT INTO public.schools (name) VALUES
  ('School of Industrial Sciences and Technology'),
  ('School of Information Science and Technology'),
  ('School of Engineering and Technology'),
  ('School of Business and Management Sciences'),
  ('School of Pharmaceutical and Health Sciences'),
  ('School of Creative Arts and Design');

INSERT INTO public.departments (name, school_id) VALUES
  ('Computer Science', (SELECT id FROM schools WHERE name = 'School of Information Science and Technology')),
  ('Information Technology', (SELECT id FROM schools WHERE name = 'School of Information Science and Technology')),
  ('Software Engineering', (SELECT id FROM schools WHERE name = 'School of Information Science and Technology')),
  ('Library and Information Science', (SELECT id FROM schools WHERE name = 'School of Information Science and Technology')),
  ('Electronic Engineering', (SELECT id FROM schools WHERE name = 'School of Engineering and Technology')),
  ('Industrial and Manufacturing Engineering', (SELECT id FROM schools WHERE name = 'School of Engineering and Technology')),
  ('Chemical and Process Systems Engineering', (SELECT id FROM schools WHERE name = 'School of Engineering and Technology')),
  ('Polymer Technology and Engineering', (SELECT id FROM schools WHERE name = 'School of Industrial Sciences and Technology')),
  ('Food Processing Technology', (SELECT id FROM schools WHERE name = 'School of Industrial Sciences and Technology')),
  ('Biotechnology', (SELECT id FROM schools WHERE name = 'School of Industrial Sciences and Technology')),
  ('Pharmaceutical Technology', (SELECT id FROM schools WHERE name = 'School of Pharmaceutical and Health Sciences')),
  ('Sports Science and Coaching', (SELECT id FROM schools WHERE name = 'School of Pharmaceutical and Health Sciences')),
  ('Accounting and Finance', (SELECT id FROM schools WHERE name = 'School of Business and Management Sciences')),
  ('Marketing', (SELECT id FROM schools WHERE name = 'School of Business and Management Sciences')),
  ('Supply Chain Management', (SELECT id FROM schools WHERE name = 'School of Business and Management Sciences')),
  ('Jewelry and Metallurgical Design', (SELECT id FROM schools WHERE name = 'School of Creative Arts and Design')),
  ('Fashion and Textile Design', (SELECT id FROM schools WHERE name = 'School of Creative Arts and Design'));
