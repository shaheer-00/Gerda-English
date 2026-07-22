import { CourseUnit } from '../types';

const unit1: CourseUnit = {
  id: 'unit-1',
  title: 'Foundations',
  bandRange: 'Band 4 → 4.5',
  description: 'Core grammar, everyday vocabulary, and the reading/listening basics everything else builds on.',
  lessons: [
    {
      id: 'unit-1-lesson-1',
      title: 'Present Simple vs Present Continuous',
      skill: 'grammar',
      checkpointQuizId: '10000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Habits vs right now',
          body: "Present Simple describes habits, facts, and routines (I study English every day). Present Continuous describes actions happening right now or temporary situations (I am studying English this week). The most common IELTS mistake at this level is using Present Continuous for permanent facts, or Present Simple for right-now actions.",
        },
        { type: 'example', label: 'Habit vs right now', text: "Habit: 'She works at a hospital.' Right now: 'She is working late tonight because of a deadline.'" },
        { type: 'example', label: 'Fact vs temporary', text: "Fact: 'Water boils at 100°C.' Temporary: 'The kettle is boiling right now.'" },
      ],
    },
    {
      id: 'unit-1-lesson-2',
      title: 'Past Simple',
      skill: 'grammar',
      checkpointQuizId: '10000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'Finished actions in the past',
          body: 'Past Simple describes finished actions at a specific time in the past. Regular verbs add -ed (study→studied, watch→watched). Many common verbs are irregular and must be memorized (go→went, have→had, do→did, see→saw).',
        },
        {
          type: 'vocab',
          words: [
            { word: 'go → went', definition: 'irregular past tense', example: 'She went to the market yesterday.' },
            { word: 'have → had', definition: 'irregular past tense', example: 'They had a great trip last year.' },
            { word: 'do → did', definition: 'irregular past tense', example: 'He did his homework before dinner.' },
            { word: 'see → saw', definition: 'irregular past tense', example: 'I saw an old friend at the station.' },
            { word: 'take → took', definition: 'irregular past tense', example: 'We took the early train.' },
            { word: 'make → made', definition: 'irregular past tense', example: 'She made a great presentation.' },
          ],
        },
      ],
    },
    {
      id: 'unit-1-lesson-3',
      title: 'Everyday Life & Routines Vocabulary',
      skill: 'vocabulary',
      checkpointQuizId: '10000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: 'Why everyday vocabulary matters',
          body: 'IELTS often tests everyday vocabulary in Listening Section 1 (booking a hotel, describing a job) and Speaking Part 1 (talking about your daily life). Building a strong base of common words makes these sections much easier.',
        },
        {
          type: 'vocab',
          words: [
            { word: 'commute', definition: 'the journey to and from work', example: 'My commute takes 40 minutes by bus.' },
            { word: 'household chores', definition: 'jobs done at home like cleaning', example: 'We share the household chores equally.' },
            { word: 'part-time', definition: 'working fewer hours than full-time', example: 'She has a part-time job at a café.' },
            { word: 'colleague', definition: 'a person you work with', example: 'My colleague helped me finish the report.' },
            { word: 'errand', definition: 'a short trip to do a task', example: 'I need to run an errand before lunch.' },
          ],
        },
      ],
    },
    {
      id: 'unit-1-lesson-4',
      title: 'Skimming & Scanning Basics',
      skill: 'reading',
      checkpointQuizId: '10000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Two different reading speeds',
          body: 'Skimming means reading quickly to get the general idea of a passage. Scanning means searching quickly for a specific piece of information (a date, a name, a number) without reading every word. In IELTS Reading, you rarely have time to read every word carefully — skim first to understand the topic, then scan for answers.',
        },
        {
          type: 'reading',
          title: 'A Short Passage: City Libraries',
          passage: "Many cities are redesigning their public libraries. Instead of only offering books, modern libraries now provide free internet access, quiet study rooms, and spaces for community events. In 2019, the city of Riverdale opened a new library with a rooftop garden and a children's reading area. The library recorded over 500,000 visitors in its first year alone.",
          note: 'Practice: scan for the number of visitors without reading every sentence.',
        },
      ],
    },
    {
      id: 'unit-1-lesson-5',
      title: 'Listening for Numbers, Dates & Times',
      skill: 'listening',
      checkpointQuizId: '10000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'The most common Section 1 trap',
          body: "IELTS Listening Section 1 almost always includes numbers — phone numbers, prices, dates, and times. A common mistake is confusing similar-sounding numbers, like 'fifteen' (15) and 'fifty' (50). Listen for the stress: FIF-teen has stress on the second part, FIF-ty has stress on the first part.",
        },
        {
          type: 'listening',
          title: 'Booking a Hotel Room',
          script: "Good morning, Sunrise Hotel, how can I help you? Hi, I'd like to book a room for three nights, starting on the 13th of May. That's fine — we have a double room available for 95 dollars per night. Could I get your phone number, please? Yes, it's oh-seven-nine-double-five-one-three-two-oh.",
          note: 'Listen for the date, the price, and the phone number.',
        },
      ],
    },
    {
      id: 'unit-1-lesson-6',
      title: 'Articles & Prepositions',
      skill: 'grammar',
      checkpointQuizId: '10000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'a/an/the and in/on/at',
          body: "Use 'a/an' for one non-specific thing (a book, an apple), and 'the' for something specific or already mentioned (the book on the table). Common prepositions of place include 'in' (a room, a city), 'on' (a table, a street), and 'at' (a specific point, like 'at the door'). Prepositions of time: 'in' (months/years), 'on' (days/dates), 'at' (clock times).",
        },
        { type: 'example', label: 'Getting more specific', text: "'I live in London, on Baker Street, at number 12.' — notice how in/on/at get more specific." },
      ],
    },
    {
      id: 'unit-1-lesson-7',
      title: 'Common IELTS Topics & Unit Review',
      skill: 'vocabulary',
      checkpointQuizId: '10000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'The recurring IELTS topics',
          body: 'IELTS reading, listening, and speaking regularly return to a small set of topics: education, health, environment, technology, and work. Learning core vocabulary for these topics early pays off across the whole test, not just one section.',
        },
        {
          type: 'vocab',
          words: [
            { word: 'curriculum', definition: 'subjects taught in a school', example: 'The school updated its curriculum.' },
            { word: 'wellbeing', definition: 'health and happiness', example: 'Exercise improves your wellbeing.' },
            { word: 'sustainable', definition: 'able to continue without harming the environment', example: 'Solar power is a sustainable energy source.' },
            { word: 'workplace', definition: 'the place where you work', example: 'Our workplace has flexible hours.' },
            { word: 'innovation', definition: 'a new idea or method', example: 'The company is known for innovation.' },
          ],
        },
        {
          type: 'explanation',
          heading: 'Unit 1 recap',
          body: "You've covered Present Simple/Continuous, Past Simple, everyday and topic vocabulary, skimming/scanning, listening for numbers, and articles/prepositions — the foundation for everything in Unit 2.",
        },
      ],
    },
  ],
};

export default unit1;
