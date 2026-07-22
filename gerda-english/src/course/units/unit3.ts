import { CourseUnit } from '../types';

const unit3: CourseUnit = {
  id: 'unit-3',
  title: 'Exam Skills',
  bandRange: 'Band 5.5 → 6',
  description: 'Complex grammar, harder reading/listening question types, full Writing Task 1/2 structures, and Speaking Parts 2-3.',
  lessons: [
    {
      id: 'unit-3-lesson-1',
      title: 'Conditionals (1st & 2nd)',
      skill: 'grammar',
      checkpointQuizId: '30000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Realistic vs unreal situations',
          body: "First conditional describes realistic future possibilities: 'If it rains, I will stay home' (if + present simple, will + base verb). Second conditional describes unreal or unlikely situations: 'If I had more time, I would travel more' (if + past simple, would + base verb). Using conditionals correctly is a strong sign of grammatical range in IELTS Writing and Speaking.",
        },
        {
          type: 'example',
          label: 'First vs second',
          text: "First: 'If she studies hard, she will pass the exam.' Second: 'If she studied harder, she would pass the exam.' (implies she currently isn't studying enough)",
        },
      ],
    },
    {
      id: 'unit-3-lesson-2',
      title: 'Relative Clauses',
      skill: 'grammar',
      checkpointQuizId: '30000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'Combining ideas smoothly',
          body: "Relative clauses add extra information about a noun without starting a new sentence, using who (people), which (things), or that (people or things). 'The book that I read was excellent' vs two separate sentences: 'I read a book. It was excellent.' Combining ideas this way makes your writing more sophisticated.",
        },
        {
          type: 'example',
          label: 'Who / which',
          text: "'The scientist who discovered the vaccine won an award.' / 'The city, which has a population of 2 million, is growing quickly.'",
        },
      ],
    },
    {
      id: 'unit-3-lesson-3',
      title: 'Reading: Matching Headings',
      skill: 'reading',
      checkpointQuizId: '30000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: 'Main idea, not detail',
          body: 'Matching Headings questions ask you to match a heading to each paragraph, testing whether you understand the main idea of each paragraph — not just details. Strategy: read the first and last sentence of each paragraph first (they usually summarize the main point), then match. Watch out for headings that use similar words but describe a different idea (distractors).',
        },
        {
          type: 'reading',
          title: 'Passage: Remote Work Trends',
          passage: 'Paragraph A: Since 2020, many companies have shifted to allowing employees to work from home permanently. This shift was driven initially by necessity but has since proven popular with staff. Paragraph B: However, remote work isn\'t without its challenges. Employees often report feelings of isolation, and collaboration on complex projects can be more difficult without face-to-face contact.',
          note: "Practice: which heading fits Paragraph A — 'The Rise of Permanent Remote Work' or 'The Drawbacks of Working From Home'? (The first — Paragraph B covers the drawbacks.)",
        },
      ],
    },
    {
      id: 'unit-3-lesson-4',
      title: 'Listening: Map Labeling & Implied Meaning',
      skill: 'listening',
      checkpointQuizId: '30000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Direction words and tone',
          body: 'Map labeling questions ask you to follow directions and mark locations on a map — listen carefully for direction words (left, right, opposite, next to, between) and reference points (starting from the entrance, near the car park). Implied meaning means understanding what a speaker means even when they don\'t say it directly — for example, hesitation or a change in tone can suggest doubt.',
        },
        {
          type: 'listening',
          title: 'Campus Directions',
          script: 'Okay, so from the main entrance, walk straight ahead past the library on your right. Take the first left, and the science building will be directly opposite the cafeteria. The lab you\'re looking for is on the second floor, next to the stairs.',
          note: 'Practice tracing this route on an imagined map: entrance → past library (right) → left turn → science building (opposite cafeteria) → 2nd floor, next to stairs.',
        },
      ],
    },
    {
      id: 'unit-3-lesson-5',
      title: 'Writing Task 1: Line Graphs & Trends',
      skill: 'writing',
      checkpointQuizId: '30000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'Trend vocabulary',
          body: 'Line graphs usually show change over time. Key trend vocabulary: rise/increase, fall/decrease, fluctuate (go up and down repeatedly), remain stable/steady, peak (reach the highest point), and plummet (fall sharply). Also use adverbs to describe the speed and size of change: dramatically, gradually, slightly, significantly.',
        },
        {
          type: 'writing',
          prompt: 'The line graph shows the number of visitors to three museums between 2000 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
          guidance: "Structure: introduction (paraphrase) → overview (which museum grew most, which declined, any notable pattern) → body paragraphs comparing specific figures with trend vocabulary. Try describing at least one 'fluctuation' and one 'steady' trend using the vocabulary above.",
        },
      ],
    },
    {
      id: 'unit-3-lesson-6',
      title: 'Writing Task 2: Advantages/Disadvantages Essay',
      skill: 'writing',
      checkpointQuizId: '30000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'Weighing both sides',
          body: 'This essay type asks you to discuss the advantages and disadvantages of a situation, sometimes also asking which outweighs the other. Structure: introduction (paraphrase + outline your approach), body 1 (advantages, with examples), body 2 (disadvantages, with examples), conclusion (your overall judgment if the question asks for one).',
        },
        {
          type: 'writing',
          prompt: 'In some countries, more people are choosing to live alone. What are the advantages and disadvantages of this trend?',
          guidance: "Structure: intro → body 1: advantages (independence, personal space, flexibility — with an example) → body 2: disadvantages (loneliness, higher cost, less support in emergencies — with an example) → conclusion (balanced final thought). Use linking words like 'on the one hand... on the other hand' to organize clearly.",
        },
      ],
    },
    {
      id: 'unit-3-lesson-7',
      title: 'Speaking Part 2 & 3 & Unit Review',
      skill: 'speaking',
      checkpointQuizId: '30000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'Cue card, then discussion',
          body: "Speaking Part 2 gives you a 'cue card' topic with 1 minute to prepare and 1-2 minutes to speak, covering all the bullet points given. Part 3 follows with more abstract discussion questions related to the Part 2 topic, expecting longer, more analytical answers.",
        },
        {
          type: 'speaking',
          prompt: 'Cue card: Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how this skill would help you. Practice speaking about this for 1-2 minutes.',
          guidance: 'Use the 1-minute prep time to jot quick notes for each bullet point, then speak naturally without reading word-for-word. Aim to cover all four points and use varied vocabulary and tenses (e.g. present, future, conditional).',
        },
        {
          type: 'explanation',
          heading: 'Unit 3 recap',
          body: 'Conditionals, relative clauses, matching headings, map labeling, Task 1 line graphs, Task 2 advantages/disadvantages, and Speaking Parts 2-3 — you now have the core skill set for Band 5.5-6. Unit 4 pushes toward 6.5 with more advanced language and exam strategy.',
        },
      ],
    },
  ],
};

export default unit3;
