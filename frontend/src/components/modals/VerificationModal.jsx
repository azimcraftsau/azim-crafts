import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const VERIFICATION_STEPS = [
  { label: 'Business Name', value: 'AZIM CRAFTS' },
  { label: 'Category', value: 'Antique Store' },
  { label: 'Location', value: 'City of Hume, VIC' },
  { label: 'Customer Satisfaction', value: 'Excellent' },
  { label: 'Service Quality', value: 'Excellent' },
  { label: 'Reputation', value: 'Excellent' },
  { label: 'Integrity and Trustworthiness', value: 'Excellent' },
  { label: 'Quality Score', isAnimatedScore: true }
];

export const VerificationModal = ({ isOpen, onClose }) => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scoreCount, setScoreCount] = useState(1);
  const [isDone, setIsDone] = useState(false);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCompletedSteps(0);
      setProgress(0);
      setScoreCount(1);
      setIsDone(false);
      return;
    }

    setCompletedSteps(0);
    setProgress(0);
    setScoreCount(1);
    setIsDone(false);

    let stepIndex = 0;
    const totalSteps = VERIFICATION_STEPS.length;

    // Steps 1 to 7 appear smoothly one by one
    const stepInterval = setInterval(() => {
      stepIndex++;
      const currentProgress = Math.min(100, Math.round((stepIndex / totalSteps) * 100));
      setProgress(currentProgress);
      setCompletedSteps(stepIndex);

      // When reaching Quality Score (the 8th line), start smooth visible counting
      if (stepIndex === totalSteps) {
        clearInterval(stepInterval);
        setScoreCount(1);

        // Smooth visible counter: increases by 2 every 25ms (~1.2 seconds total duration)
        let currentScore = 1;
        const scoreInterval = setInterval(() => {
          currentScore += 2;
          if (currentScore >= 95) {
            currentScore = 95;
            setScoreCount(95);
            clearInterval(scoreInterval);
            setTimeout(() => {
              setIsDone(true);
            }, 300);
          } else {
            setScoreCount(currentScore);
          }
        }, 25);
      }
    }, 320);

    return () => clearInterval(stepInterval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-menu select-none flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Verification Modal Container (Spacious & Polished Layout) */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in border border-neutral-200 z-10">
        
        {/* Title */}
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 text-center mb-5 tracking-wide">
          Business Verification
        </h3>

        {/* Green Smooth Progress Bar */}
        <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden mb-6 p-0.5 border border-neutral-200/60">
          <div 
            className="bg-[#34a853] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated Checklist Lines */}
        <div className="space-y-2.5 text-xs sm:text-sm text-neutral-800 font-medium min-h-[225px]">
          {VERIFICATION_STEPS.map((step, idx) => {
            const isVisible = idx < completedSteps;
            return (
              <div 
                key={idx}
                className={`flex items-center gap-2.5 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
                }`}
              >
                <Check className="w-4 h-4 text-[#34a853] stroke-[3] shrink-0" />
                <span className="leading-snug">
                  <span className="font-semibold text-neutral-900">{step.label}:</span>{' '}
                  {step.isAnimatedScore ? (
                    <span className="text-neutral-900 font-bold font-mono text-sm sm:text-base">
                      {scoreCount >= 95 ? '95%+' : `${scoreCount}%`}
                    </span>
                  ) : (
                    <span className="text-neutral-700">{step.value}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Verification Status & Close Button (Shown when 100% complete) */}
        {isDone && (
          <div className="mt-6 pt-2 text-center animate-fade-in space-y-4">
            <div className="text-base sm:text-lg font-bold text-[#008a00] tracking-wide">
              Business Verification Status: Verified
            </div>

            <button
              onClick={onClose}
              className="w-36 mx-auto block bg-[#c8924b] hover:bg-[#b57f38] text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all shadow-sm cursor-pointer hover:shadow active:scale-98"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
