'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TestTutorialProps {
  onComplete: () => void;
}

export function TestTutorial({ onComplete }: TestTutorialProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#f0f0f0] border-2 border-[#003366] w-[600px] shadow-2xl flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-[#003366] text-white p-2 font-bold flex justify-between items-center text-[14px]">
          <span>USMLE Examination Tutorial</span>
          <span>Step {step} of {totalSteps}</span>
        </div>

        {/* Content */}
        <div className="p-6 bg-white min-h-[300px] flex flex-col items-center justify-center text-center">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#003366]">Welcome to the Examination</h2>
              <p className="text-gray-700 leading-relaxed">
                This tutorial will familiarize you with the testing interface and tools. 
                You must complete this tutorial before beginning the test.
                <br/><br/>
                Click <strong>Next</strong> to continue.
              </p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#003366]">Keyboard Shortcuts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can navigate the exam using your mouse or standard keyboard shortcuts:
              </p>
              <ul className="text-left bg-gray-100 p-4 inline-block rounded-md border border-gray-300">
                <li><strong>A, B, C, D, E...</strong> - Select an answer option</li>
                <li><strong>Spacebar</strong> - Strikethrough an option</li>
                <li><strong>Alt + N</strong> - Proceed to next item</li>
                <li><strong>Alt + P</strong> - Return to previous item</li>
              </ul>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#003366]">Calculator & Lab Values</h2>
              <p className="text-gray-700 leading-relaxed">
                The top toolbar contains a <strong>Calculator</strong> and <strong>Lab Values</strong> reference.
                <br/><br/>
                These tools open as draggable windows so you can move them around the screen while reading the question.
              </p>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#003366]">Exhibit Display</h2>
              <p className="text-gray-700 leading-relaxed">
                Some questions contain images or media. Clicking an image opens the <strong>Exhibit Display</strong>.
                <br/><br/>
                In the Exhibit Display, you can use the bottom toolbar to Zoom, Adjust Contrast, Invert Colors, and Add Notes.
              </p>
            </div>
          )}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#003366]">Suspending & Ending Blocks</h2>
              <p className="text-gray-700 leading-relaxed">
                At the bottom of the screen, you will find the timer.
                <br/><br/>
                If you need to take an unscheduled break, click <strong>Suspend</strong> to pause the timer and exit. 
                When you are finished with all questions, click <strong>End Block</strong> to submit your answers.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#e0e0e0] border-t border-gray-400 p-3 flex justify-between items-center">
          <button 
            onClick={handlePrev} 
            disabled={step === 1}
            className="px-4 py-1.5 bg-white border border-gray-400 font-bold text-gray-800 disabled:opacity-50 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <button 
            onClick={handleNext}
            className="px-4 py-1.5 bg-[#003366] text-white font-bold flex items-center gap-1"
          >
            {step === totalSteps ? 'End Tutorial' : 'Next'} {step < totalSteps && <ChevronRight size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
}
