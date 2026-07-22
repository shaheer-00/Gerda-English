-- IELTS Course checkpoint quizzes
-- Run this in Supabase's SQL Editor AFTER supabase-schema.sql has already been run.
-- Each INSERT below uses a fixed id matching a lesson's checkpointQuizId in
-- src/course/units/*.ts — the id must match exactly, or that lesson's
-- checkpoint will silently fail to load (getQuizById returns null).
--
-- Populated by later tasks in docs/superpowers/plans/2026-07-23-ielts-course.md
-- (Tasks 3-6), one unit's worth of INSERTs per task, appended below in order.

-- Unit 1: Foundations (Band 4 → 4.5) — xp_reward 30 each
INSERT INTO quizzes (id, title, description, questions, xp_reward, created_by) VALUES
('10000000-0000-4000-8000-000000000001', 'Checkpoint: Present Simple vs Present Continuous', 'Unit 1, Lesson 1 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["She study English every day.","She studies English every day.","She is study English every day.","She studying English every day."],"correct_answer":"She studies English every day."},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Fill the gap: Right now, I ___ my homework.","options":["do","does","am doing","did"],"correct_answer":"am doing"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Which sentence describes a permanent fact?","options":["I am living in London this month.","I live in London.","I am living.","I lived in London."],"correct_answer":"I live in London."},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct question.","options":["Does she works on Sundays?","Do she work on Sundays?","Does she work on Sundays?","Is she works on Sundays?"],"correct_answer":"Does she work on Sundays?"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Which is a common IELTS listening test topic that uses Present Simple?","options":["Daily routines and habits","A story that already finished","A plan for next year only","A dream from last night"],"correct_answer":"Daily routines and habits"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000002', 'Checkpoint: Past Simple', 'Unit 1, Lesson 2 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct past form of ''go''.","options":["goed","went","gone","going"],"correct_answer":"went"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["I studyed for the test yesterday.","I studied for the test yesterday.","I have study for the test yesterday.","I am studied for the test yesterday."],"correct_answer":"I studied for the test yesterday."},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Past tense of ''see''?","options":["seed","seen","saw","sawed"],"correct_answer":"saw"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which sentence is correct?","options":["She did not went to school.","She did not go to school.","She not went to school.","She didn''t went to school."],"correct_answer":"She did not go to school."},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which time word usually signals Past Simple?","options":["every day","right now","yesterday","at the moment"],"correct_answer":"yesterday"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000003', 'Checkpoint: Everyday Life & Routines Vocabulary', 'Unit 1, Lesson 3 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"What does ''commute'' mean?","options":["A type of food","The journey to and from work","A household chore","A day off work"],"correct_answer":"The journey to and from work"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Choose the correct word: ''I have to run an ___ to the post office.''","options":["errand","colleague","commute","chore"],"correct_answer":"errand"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"A ''colleague'' is...","options":["your neighbor","a person you work with","your boss only","a family member"],"correct_answer":"a person you work with"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''Part-time'' means...","options":["working full hours","not working at all","working fewer hours than full-time","working only on weekends"],"correct_answer":"working fewer hours than full-time"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''Household chores'' are...","options":["jobs done at home like cleaning","meals you cook","holidays you take","money you save"],"correct_answer":"jobs done at home like cleaning"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000004', 'Checkpoint: Skimming & Scanning Basics', 'Unit 1, Lesson 4 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What is ''skimming''?","options":["Reading every word carefully","Reading quickly for the general idea","Memorizing a passage","Translating a passage"],"correct_answer":"Reading quickly for the general idea"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What is ''scanning'' used for?","options":["Understanding grammar","Finding specific information quickly","Writing a summary","Learning new vocabulary"],"correct_answer":"Finding specific information quickly"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"According to the passage, how many visitors did the library have in its first year?","options":["50,000","100,000","500,000","5,000"],"correct_answer":"500,000"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What year did the Riverdale library open?","options":["2018","2019","2020","2021"],"correct_answer":"2019"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Why is scanning useful in the IELTS Reading test?","options":["You have plenty of time to read everything","You often need to find answers quickly under time pressure","It replaces the need to understand the passage","It is only used for Listening"],"correct_answer":"You often need to find answers quickly under time pressure"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000005', 'Checkpoint: Listening for Numbers, Dates & Times', 'Unit 1, Lesson 5 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What date does the booking start?","options":["3rd of May","13th of May","30th of May","15th of May"],"correct_answer":"13th of May"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"How many nights is the room booked for?","options":["Two","Three","Thirteen","Thirty"],"correct_answer":"Three"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What is the price per night?","options":["$59","$95","$105","$15"],"correct_answer":"$95"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Which number is often confused with ''fifty''?","options":["Fifteen","Fifth","Fifty-five","Five"],"correct_answer":"Fifteen"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What kind of room is available?","options":["Single room","Double room","Family room","Suite"],"correct_answer":"Double room"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000006', 'Checkpoint: Articles & Prepositions', 'Unit 1, Lesson 6 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct article: ''She bought ___ umbrella.''","options":["a","an","the","no article"],"correct_answer":"an"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct preposition: ''The meeting is ___ Monday.''","options":["in","on","at","by"],"correct_answer":"on"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct preposition: ''We arrived ___ 6 o''clock.''","options":["in","on","at","for"],"correct_answer":"at"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct preposition: ''He was born ___ 1995.''","options":["in","on","at","since"],"correct_answer":"in"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["I saw a elephant at the zoo.","I saw an elephant at the zoo.","I saw the elephant on the zoo.","I saw elephant at the zoo."],"correct_answer":"I saw an elephant at the zoo."}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000007', 'Checkpoint: Common IELTS Topics & Unit Review', 'Unit 1, Lesson 7 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Sustainable'' means...","options":["expensive","able to continue without harming the environment","old-fashioned","difficult to use"],"correct_answer":"able to continue without harming the environment"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Curriculum'' refers to...","options":["a type of exam","subjects taught in a school","a school building","a teacher''s salary"],"correct_answer":"subjects taught in a school"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Wellbeing'' means...","options":["a type of job","health and happiness","a school subject","a kind of exam"],"correct_answer":"health and happiness"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Innovation'' means...","options":["an old tradition","a new idea or method","a type of building","a health problem"],"correct_answer":"a new idea or method"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"Which topic is NOT commonly tested in IELTS?","options":["Education","Environment","Technology","Professional cooking techniques for restaurants"],"correct_answer":"Professional cooking techniques for restaurants"}
]'::jsonb, 30, 'course');
