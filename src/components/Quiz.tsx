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

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  const handleSelect = (value: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);

    if (currentStep < quizQuestions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      onComplete(newAnswers as QuizAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                  answers[currentQuestion.id as keyof QuizAnswers] === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:bg-[var(--card-hover)]'
                }`}
              >
                <div className="font-semibold text-lg">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                )}
              </button>
            ))}
          </div>
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
