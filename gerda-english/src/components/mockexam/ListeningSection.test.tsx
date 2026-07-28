import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListeningSection from './ListeningSection';
import { MockExamSection } from '../../lib/supabase';

const sections: MockExamSection[] = [
  {
    type: 'listening',
    section_number: 1,
    title: 'Booking a Room',
    instructions: 'Listen and answer questions 1-2.',
    listening_script: 'Hello, I would like to book a room for two nights.',
    questions: [
      {
        id: 'q1',
        question_text: 'How many nights does the caller want?',
        type: 'multiple_choice',
        options: ['One', 'Two', 'Three'],
        correct_answer: 'Two',
      },
    ],
  },
];

class FakeUtterance {
  onend: (() => void) | null = null;
  constructor(public text: string) {}
}

describe('ListeningSection', () => {
  beforeEach(() => {
    window.SpeechSynthesisUtterance = FakeUtterance as unknown as typeof SpeechSynthesisUtterance;
    window.speechSynthesis = { speak: vi.fn() } as unknown as SpeechSynthesis;
  });

  it('renders every question and reports answers via onAnswer', () => {
    const onAnswer = vi.fn();
    render(
      <ListeningSection sections={sections} answers={{}} onAnswer={onAnswer} onExpire={() => {}} />
    );

    expect(screen.getByText(/how many nights does the caller want/i)).toBeTruthy();

    fireEvent.click(screen.getByText('Two'));
    expect(onAnswer).toHaveBeenCalledWith('q1', 'Two');
  });
});
