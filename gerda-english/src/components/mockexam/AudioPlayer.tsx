import { useState } from 'react';
import { Play, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  script: string;
  label: string;
}

const AudioPlayer = ({ script, label }: AudioPlayerProps) => {
  const [status, setStatus] = useState<'idle' | 'playing' | 'played'>('idle');
  const supportsSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const play = () => {
    if (!supportsSpeech || status !== 'idle') return;
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.onend = () => setStatus('played');
    setStatus('playing');
    window.speechSynthesis.speak(utterance);
  };

  if (!supportsSpeech) {
    return (
      <div className="card-warm bg-warm-tan-50">
        <p className="text-sm text-warm-brown-600 mb-2 font-semibold">
          Audio playback isn't supported in this browser — read the script instead:
        </p>
        <p className="text-warm-brown-800 whitespace-pre-line">{script}</p>
      </div>
    );
  }

  return (
    <div className="card-warm bg-warm-tan-50 flex items-center gap-3">
      <button
        onClick={play}
        disabled={status !== 'idle'}
        className="btn-warm btn-warm-primary flex items-center gap-2 disabled:opacity-50"
      >
        {status === 'playing' ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
        {status === 'idle' ? `Play ${label}` : status === 'playing' ? 'Playing...' : 'Played'}
      </button>
      {status !== 'idle' && (
        <p className="text-sm text-warm-brown-500">Audio plays once, same as the real test — no rewind.</p>
      )}
    </div>
  );
};

export default AudioPlayer;
