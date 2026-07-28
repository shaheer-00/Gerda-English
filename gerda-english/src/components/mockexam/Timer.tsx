import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  durationSeconds: number;
  onExpire: () => void;
}

const Timer = ({ durationSeconds, onExpire }: TimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLowTime = secondsLeft <= 300;

  return (
    <div
      role="timer"
      className={`font-mono font-bold text-lg px-3 py-1 rounded-lg ${
        isLowTime ? 'bg-red-100 text-red-700' : 'bg-warm-tan-100 text-warm-brown-700'
      }`}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;
