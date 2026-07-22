import { CourseUnit } from '../types';

const unit4: CourseUnit = {
  id: 'unit-4',
  title: 'Band 6.5 Push',
  bandRange: 'Band 6 → 6.5',
  description: 'Academic collocations, cohesive devices, inference reading, multi-speaker listening, and higher-band writing/speaking practice.',
  lessons: [
    {
      id: 'unit-4-lesson-1',
      title: 'Academic Collocations & Paraphrasing',
      skill: 'vocabulary',
      checkpointQuizId: '40000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Words that go together',
          body: "Collocations are words that naturally go together (make a decision, not 'do a decision'). Paraphrasing — expressing the same idea with different words — is essential for IELTS Reading (matching information) and Writing/Speaking (avoiding repetition and showing range). Practice paraphrasing by replacing key words with synonyms and changing sentence structure.",
        },
        {
          type: 'vocab',
          words: [
            { word: 'make a decision', definition: 'not "do a decision"', example: 'We need to make a decision by Friday.' },
            { word: 'conduct research', definition: 'not "make research"', example: 'The university conducted research into sleep patterns.' },
            { word: 'have an impact on', definition: 'not "make an impact to"', example: 'Diet has a big impact on health.' },
            { word: 'raise awareness', definition: 'not "increase awareness"', example: 'The campaign aims to raise awareness of recycling.' },
            { word: 'play a role in', definition: 'not "do a role in"', example: 'Genetics play a role in many illnesses.' },
          ],
        },
        { type: 'example', label: 'Paraphrasing', text: "Original: 'Pollution is a big problem in cities.' Paraphrased: 'Urban pollution poses a significant challenge.'" },
      ],
    },
    {
      id: 'unit-4-lesson-2',
      title: 'Complex Sentences & Cohesive Devices',
      skill: 'grammar',
      checkpointQuizId: '40000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'Linking ideas at a higher level',
          body: "Cohesive devices link ideas clearly across sentences and paragraphs: 'however' and 'nevertheless' show contrast; 'furthermore' and 'moreover' add information; 'consequently' and 'as a result' show cause and effect; 'in other words' clarifies a point. Overusing simple linkers like 'and' and 'but' limits your score — mix in more sophisticated connectors, but don't force them into every sentence.",
        },
        {
          type: 'example',
          label: 'Chaining ideas',
          text: "'The policy was expensive to implement. However, it significantly reduced traffic congestion, and consequently, air quality improved across the city.'",
        },
      ],
    },
    {
      id: 'unit-4-lesson-3',
      title: 'Reading: Inference & Matching Sentence Endings',
      skill: 'reading',
      checkpointQuizId: '40000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: 'Reading between the lines',
          body: "Inference questions ask what the passage suggests without stating directly — read between the lines using tone and context clues. Matching Sentence Endings requires finding the correct ending for a sentence beginning based on precise logical and grammatical fit, not just similar vocabulary — one of the hardest IELTS Reading question types.",
        },
        {
          type: 'reading',
          title: 'Passage: The Decline of Handwriting',
          passage: 'As digital devices dominate daily communication, fewer people regularly write by hand. Some researchers argue this may affect memory retention, since studies have linked handwriting with stronger recall than typing. Despite this, schools continue to reduce time spent teaching cursive writing, reflecting a broader shift in educational priorities.',
          note: "Inference practice: the passage doesn't say 'schools are wrong to do this' directly — but the tone (contrasting research findings with school policy) implies mild criticism of the trend.",
        },
      ],
    },
    {
      id: 'unit-4-lesson-4',
      title: 'Listening: Multi-speaker Discussions',
      skill: 'listening',
      checkpointQuizId: '40000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Tracking who thinks what',
          body: "IELTS Listening Sections 3 and 4 often involve multiple speakers (like students discussing an assignment) or a single academic lecture. With multiple speakers, track who holds which opinion — speakers often disagree or build on each other's points. Listen for signposting language like 'I agree, but...' or 'that's a good point, however...'",
        },
        {
          type: 'listening',
          title: 'Group Project Discussion',
          script: "Student A: I think we should focus our presentation on renewable energy in general. Student B: That's a good point, but I think we should narrow it down — maybe just solar power, since we have more research on that. Student A: Fair enough, that would make it more focused. Student B: Great, so let's also split the workload — I'll cover the technical side, and you can cover the environmental impact.",
          note: 'Track: whose idea changed, and what was the final agreement.',
        },
      ],
    },
    {
      id: 'unit-4-lesson-5',
      title: 'Writing Task 2: Discussion Essay (Both Views)',
      skill: 'writing',
      checkpointQuizId: '40000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'Precision over simplicity',
          body: 'This essay type differs slightly from advantages/disadvantages: it asks you to discuss two given opinions and give your own. Use higher-level vocabulary and complex sentence structures to reach Band 6.5+ — precise word choice, varied sentence length, and accurate use of cohesive devices from Lesson 4.2 all matter here.',
        },
        {
          type: 'writing',
          prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programs. Others believe students should be free to choose their own extracurricular activities. Discuss both views and give your own opinion.',
          guidance: 'Structure: intro (paraphrase + state you\'ll cover both views + your opinion) → body 1: the case for compulsory service (with an example) → body 2: the case for free choice (with an example) → conclusion (clear final opinion). Try using at least 2 cohesive devices from Lesson 4.2 and 2 collocations from Lesson 4.1.',
        },
      ],
    },
    {
      id: 'unit-4-lesson-6',
      title: 'Speaking Part 3: Abstract Discussion',
      skill: 'speaking',
      checkpointQuizId: '40000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'Beyond personal experience',
          body: 'Part 3 questions move beyond personal experience to broader, more abstract ideas related to the Part 2 topic — often about society, trends, or hypothetical situations. Extend your answers with reasons, examples, and sometimes counterarguments, rather than short, simple responses.',
        },
        {
          type: 'speaking',
          prompt: "Practice these Part 3 questions (following on from 'describe a skill you'd like to learn'): 1) Do you think schools should teach more practical skills? 2) How has the importance of certain skills changed over time? 3) What skills do you think will be important in the future?",
          guidance: 'For each question, structure your answer as: direct response → reason → example → (optional) a brief counterpoint. This shows the analytical depth examiners look for at higher bands.',
        },
      ],
    },
    {
      id: 'unit-4-lesson-7',
      title: 'Full Review: Exam Strategy',
      skill: 'review',
      checkpointQuizId: '40000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'Time management matters as much as language',
          body: "Final review before your target band: time management matters as much as language ability. In Reading, don't spend more than ~20 minutes per passage. In Writing, aim to spend 20 minutes on Task 1 and 40 on Task 2 (Task 2 is worth more). In Listening, use the time between sections to check answers, not to relax. In Speaking, remember that fluency and coherence matter as much as perfect grammar — natural pauses are fine, but avoid long silences.",
        },
        {
          type: 'example',
          label: 'Pre-exam checklist',
          text: '1) Reading — skim first, manage time per passage. 2) Listening — predict answers before audio starts. 3) Writing — plan for 2 minutes before writing either task. 4) Speaking — extend every answer with a reason or example.',
        },
        {
          type: 'explanation',
          heading: 'Course complete',
          body: "You've built grammar (tenses, conditionals, relative clauses, cohesion), vocabulary (everyday, academic, collocations), reading strategy (skimming, T/F/NG, headings, inference), listening strategy (numbers, detail, maps, multi-speaker), writing structure (Task 1 and Task 2, several essay types), and speaking practice (all 3 parts) — the full path from Band 4 toward Band 6.5. Keep practicing regularly, and use the Mistakes Bank to track what still needs work.",
        },
      ],
    },
  ],
};

export default unit4;
