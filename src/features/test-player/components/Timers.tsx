import { useState, useEffect, useRef } from 'react';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export function TimerDisplay({ 
  initialTimeLeft, 
  initialElapsed, 
  isTimed, 
  onTimeUp,
  isPaused = false,
  type = 'combined',
  className = ''
}: { 
  initialTimeLeft: number | null, 
  initialElapsed: number, 
  isTimed: boolean, 
  onTimeUp: () => void,
  isPaused?: boolean,
  type?: 'elapsed' | 'remaining' | 'combined',
  className?: string
}) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [timeElapsed, setTimeElapsed] = useState(initialElapsed);

  const onTimeUpRef = useRef(onTimeUp);
  const firedRef = useRef(false);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    if (!isTimed || timeLeft === null || isPaused) return;
    if (timeLeft <= 0) {
      // Fire once: the old code re-invoked onTimeUp on every re-render at 0.
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeUpRef.current();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimed, timeLeft, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const elapsedTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(elapsedTimer);
  }, [isPaused]);

  if (type === 'elapsed') {
    return <span className={className}>{formatTime(timeElapsed)}</span>;
  }
  if (type === 'remaining') {
    return <span className={className}>{timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}</span>;
  }

  let colorClass = "text-primary";
  if (isTimed && timeLeft !== null) {
    if (timeLeft < 60) colorClass = "text-red-600";
    else if (timeLeft < 300) colorClass = "text-amber-600";
  }

  return (
    <div className={`font-mono font-bold tracking-wider transition-colors duration-500 ${colorClass} ${className}`}>
      {isTimed ? (timeLeft !== null ? formatTime(timeLeft) : '--:--:--') : formatTime(timeElapsed)}
    </div>
  );
}

export function QuestionTimerDisplay({
  questionId,
  baseSeconds,
  isTicking,
  onCheckpoint,
  className = '',
}: {
  questionId: string;
  baseSeconds: number;
  isTicking: boolean;
  onCheckpoint: () => void;
  className?: string;
}) {
  const [localElapsed, setLocalElapsed] = useState(0);
  const onCheckpointRef = useRef(onCheckpoint);
  useEffect(() => { onCheckpointRef.current = onCheckpoint; }, [onCheckpoint]);

  useEffect(() => {
    setLocalElapsed(0);
    if (!isTicking) return;

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      setLocalElapsed(ticks);
      if (ticks % 10 === 0) {
        onCheckpointRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [questionId, baseSeconds, isTicking]);

  return <span className={className}>{formatTime(baseSeconds + localElapsed)}</span>;
}
