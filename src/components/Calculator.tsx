'use client';

import { useState } from 'react';

export function Calculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      setPreviousValue(inputValue);
      setEquation(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let newValue = 0;

      if (operator === '+') newValue = currentValue + inputValue;
      else if (operator === '-') newValue = currentValue - inputValue;
      else if (operator === '*') newValue = currentValue * inputValue;
      else if (operator === '/') newValue = currentValue / inputValue;

      setPreviousValue(newValue);
      setDisplay(String(newValue));
      setEquation(`${newValue} ${nextOperator}`);
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const handleEqual = () => {
    if (!operator || previousValue == null) return;
    const inputValue = parseFloat(display);
    let newValue = 0;

    if (operator === '+') newValue = previousValue + inputValue;
    else if (operator === '-') newValue = previousValue - inputValue;
    else if (operator === '*') newValue = previousValue * inputValue;
    else if (operator === '/') newValue = previousValue / inputValue;

    setDisplay(String(newValue));
    setEquation('');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const btnClass = "bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-md active:bg-slate-300 transition-colors";
  const opClass = "bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-md active:bg-blue-300 transition-colors";

  return (
    <div className="absolute top-16 right-4 w-72 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 animate-in slide-in-from-top-4">
      {/* Header */}
      <div className="bg-slate-800 text-white p-3 flex justify-between items-center cursor-move">
        <span className="font-semibold text-sm flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Calculator
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-4">
        {/* Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-right">
          <div className="text-xs text-slate-400 h-4 mb-1 font-mono">{equation}</div>
          <div className="text-3xl font-mono text-slate-800 overflow-hidden text-ellipsis">{display}</div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className="col-span-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-md transition-colors">C</button>
          <button onClick={() => setDisplay(String(parseFloat(display) * -1))} className={btnClass}>±</button>
          <button onClick={() => performOperation('/')} className={opClass}>÷</button>

          <button onClick={() => inputDigit('7')} className={btnClass}>7</button>
          <button onClick={() => inputDigit('8')} className={btnClass}>8</button>
          <button onClick={() => inputDigit('9')} className={btnClass}>9</button>
          <button onClick={() => performOperation('*')} className={opClass}>×</button>

          <button onClick={() => inputDigit('4')} className={btnClass}>4</button>
          <button onClick={() => inputDigit('5')} className={btnClass}>5</button>
          <button onClick={() => inputDigit('6')} className={btnClass}>6</button>
          <button onClick={() => performOperation('-')} className={opClass}>−</button>

          <button onClick={() => inputDigit('1')} className={btnClass}>1</button>
          <button onClick={() => inputDigit('2')} className={btnClass}>2</button>
          <button onClick={() => inputDigit('3')} className={btnClass}>3</button>
          <button onClick={() => performOperation('+')} className={opClass}>+</button>

          <button onClick={() => inputDigit('0')} className={`col-span-2 ${btnClass}`}>0</button>
          <button onClick={inputDot} className={btnClass}>.</button>
          <button onClick={handleEqual} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md active:bg-blue-800 transition-colors">=</button>
        </div>
      </div>
    </div>
  );
}
