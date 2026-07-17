'use client';

import { useState } from 'react';
import { DraggableModal } from './DraggableModal';
import { Calculator as CalcIcon } from 'lucide-react';

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
    <DraggableModal 
      isOpen={true} 
      onClose={onClose} 
      title="Calculator" 
      icon={<CalcIcon size={16} />}
      width="300px"
      height="380px"
      minWidth="300px"
      minHeight="380px"
    >
      <div className="p-4 flex flex-col h-full bg-white">
        {/* Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-right shrink-0">
          <div className="text-xs text-slate-400 h-4 mb-1 font-mono">{equation}</div>
          <div className="text-3xl font-mono text-slate-800 overflow-hidden text-ellipsis">{display}</div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 flex-1">
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
    </DraggableModal>
  );
}
