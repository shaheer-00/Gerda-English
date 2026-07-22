import { CourseUnit } from '../types';

const unit2: CourseUnit = {
  id: 'unit-2',
  title: 'Building Up',
  bandRange: 'Band 4.5 → 5.5',
  description: 'Intermediate grammar, exam-specific reading/listening strategy, and your first Writing Task 1/2 and Speaking Part 1 practice.',
  lessons: [
    {
      id: 'unit-2-lesson-1',
      title: 'Comparatives & Superlatives',
      skill: 'grammar',
      checkpointQuizId: '20000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Comparing two things vs three or more',
          body: "Comparatives compare two things (bigger, more interesting, better). Superlatives compare three or more things, showing the extreme (biggest, most interesting, best). Short adjectives add -er/-est (big→bigger→biggest); longer adjectives use more/most (interesting→more interesting→most interesting); some are irregular (good→better→best, bad→worse→worst).",
        },
        { type: 'example', label: 'Comparative vs superlative', text: "'This city is bigger than my hometown, but Tokyo is the biggest city I've ever visited.'" },
      ],
    },
    {
      id: 'unit-2-lesson-2',
      title: 'Passive Voice',
      skill: 'grammar',
      checkpointQuizId: '20000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'When the doer matters less than the action',
          body: "Active voice focuses on who does an action ('Scientists conducted the study'). Passive voice focuses on the action or the receiver, often when the doer is unknown or unimportant ('The study was conducted in 2020'). Passive voice is very common in IELTS Reading (academic/news texts) and useful in Writing Task 1 when describing processes.",
        },
        { type: 'example', label: 'Active vs passive', text: "Active: 'They built the bridge in 1990.' Passive: 'The bridge was built in 1990.'" },
      ],
    },
    {
      id: 'unit-2-lesson-3',
      title: 'Reading: True / False / Not Given',
      skill: 'reading',
      checkpointQuizId: '20000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: "Don't confuse False with Not Given",
          body: "In True/False/Not Given questions: TRUE means the statement matches the passage; FALSE means the statement contradicts the passage; NOT GIVEN means the information isn't mentioned at all — don't use outside knowledge or guess. The biggest mistake is confusing FALSE (contradicted) with NOT GIVEN (simply absent).",
        },
        {
          type: 'reading',
          title: 'Passage: Urban Bees',
          passage: 'Beekeeping has become increasingly popular in cities over the last decade. Rooftop hives now exist in many major cities, and some studies suggest urban honey can be as high quality as rural honey because cities often have a wider variety of flowering plants. However, urban beekeepers must follow strict local regulations, which vary significantly between cities.',
          note: "Practice: 'Urban honey is always better than rural honey.' Is this True, False, or Not Given? (It's False — the passage says 'can be as high quality', not 'always better'.)",
        },
      ],
    },
    {
      id: 'unit-2-lesson-4',
      title: 'Listening for Specific Detail',
      skill: 'listening',
      checkpointQuizId: '20000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Watch for corrections',
          body: "IELTS Listening multiple-choice questions often include distractors — options that sound correct but are corrected later in the audio. Listen for words like 'actually', 'but', 'on second thought' that signal a change in information. Always listen to the whole sentence before choosing an answer.",
        },
        {
          type: 'listening',
          title: 'Choosing a Course',
          script: "So, I was thinking of joining the photography course on Tuesdays. Actually, it's been moved to Thursdays now, starting next week. Oh, and the beginner course is full, but there's still space in the intermediate one. That works better for me anyway, since I've done some photography before.",
          note: 'Listen for the correction: the day changes, and the level changes.',
        },
      ],
    },
    {
      id: 'unit-2-lesson-5',
      title: 'Writing Task 1: Describing a Bar Chart',
      skill: 'writing',
      checkpointQuizId: '20000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'Introduction, overview, body',
          body: "Writing Task 1 (Academic) asks you to describe a chart, graph, or diagram in your own words — not give opinions. A strong response has: an introduction (paraphrase the question), an overview (the 1-2 biggest trends), and body paragraphs with specific data. Useful language: 'increased/decreased', 'the highest/lowest proportion', 'in contrast', 'whereas'.",
        },
        {
          type: 'writing',
          prompt: 'The bar chart shows the percentage of households with internet access in four countries in 2010 and 2020. Summarize the information by selecting and reporting the main features.',
          guidance: "Structure: 1) Introduction — paraphrase the chart's topic. 2) Overview — state the 1-2 clearest overall trends (e.g. 'internet access rose in all four countries'). 3) Body — compare specific figures using comparative language. Aim for at least 150 words. Write your response below as practice — it isn't graded automatically, but writing it out builds the habit.",
        },
      ],
    },
    {
      id: 'unit-2-lesson-6',
      title: 'Writing Task 2: Opinion Essay',
      skill: 'writing',
      checkpointQuizId: '20000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'State it, support it, restate it',
          body: 'Writing Task 2 asks for a 250+ word essay responding to a question, often asking for your opinion. A clear structure: introduction (paraphrase + state your opinion), 2 body paragraphs (one main idea each, with an example), and a conclusion (restate your opinion). Always answer the exact question asked.',
        },
        {
          type: 'writing',
          prompt: 'Some people think technology has made life easier. Others believe it has made life more complicated. Discuss both views and give your own opinion.',
          guidance: '1) Introduction — paraphrase the topic, state you\'ll discuss both views, give your opinion. 2) Body 1 — technology makes life easier (with an example). 3) Body 2 — technology makes life complicated (with an example). 4) Conclusion — restate your opinion clearly. Aim for 250+ words.',
        },
      ],
    },
    {
      id: 'unit-2-lesson-7',
      title: 'Speaking Part 1 & Unit Review',
      skill: 'speaking',
      checkpointQuizId: '20000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'Extend every answer',
          body: 'IELTS Speaking Part 1 asks simple personal questions about familiar topics (your home, work/study, hobbies, daily routine) for 4-5 minutes. Aim for natural, extended answers — not one-word replies, but not a memorized speech either. Add a reason or example to each answer.',
        },
        {
          type: 'speaking',
          prompt: 'Practice these Part 1 questions out loud: 1) Do you work or study? 2) What do you usually do in your free time? 3) Do you prefer mornings or evenings? Why?',
          guidance: "For each question, give a direct answer PLUS one extra sentence (a reason, example, or detail). Example: 'I usually read in my free time, because it helps me relax after a busy day.' Avoid memorized-sounding answers — sound natural.",
        },
        {
          type: 'explanation',
          heading: 'Unit 2 recap',
          body: "You've covered comparatives/superlatives, passive voice, True/False/Not Given reading, listening for corrections, Writing Task 1 & 2 structures, and Speaking Part 1 — you're building real exam skills now, not just grammar.",
        },
      ],
    },
  ],
};

export default unit2;
