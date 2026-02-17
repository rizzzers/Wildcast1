'use client';

import { useState } from 'react';
import { QuizAnswers } from '@/types';
import { quizQuestions } from '@/data/quiz-options';

interface QuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

export function Quiz({ onComplete }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;
  const isMultiSelect = currentQuestion.multiSelect === true;

  const advanceOrComplete = (newAnswers: QuizAnswers) => {
    if (currentStep < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setMultiSelections([]);
      }, 300);
    } else {
      onComplete(newAnswers as QuizAnswers);
    }
  };

  const handleSelect = (value: string) => {
    if (isMultiSelect) {
      setMultiSelections((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);
    advanceOrComplete(newAnswers);
  };

  const handleMultiSelectContinue = () => {
    if (multiSelections.length === 0) return;
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: multiSelections.length === 1 ? multiSelections[0] : multiSelections,
    };
    setAnswers(newAnswers);
    advanceOrComplete(newAnswers);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setMultiSelections([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentStep + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[var(--card)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="animate-fade-in" key={currentStep}>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
            {currentQuestion.question}
          </h2>
          {isMultiSelect && (
            <p className="text-sm text-gray-500 text-center mb-8">Select all that apply</p>
          )}
          {!isMultiSelect && <div className="mb-8" />}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = isMultiSelect
                ? multiSelections.includes(option.value)
                : answers[currentQuestion.id as keyof QuizAnswers] === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:bg-[var(--card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isMultiSelect && (
                      <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)]'
                          : 'border-[var(--border)]'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-lg">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue button for multi-select */}
          {isMultiSelect && (
            <button
              onClick={handleMultiSelectContinue}
              disabled={multiSelections.length === 0}
              className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                multiSelections.length > 0
                  ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white hover:scale-[1.01]'
                  : 'bg-[var(--card)] text-gray-600 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          )}
        </div>

        {/* Back button */}
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="mt-6 text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back
          </button>
        )}
      </div>
    </div>
  );
}
