/**
 * 假瘦語言類型測驗流程：題目 → 結果 → CTA
 * 模組化組件，可嵌入 Resources 或獨立測驗頁
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QUIZ_QUESTIONS, computeQuizResult } from '@/data/quiz';
import { ROUTES } from '@/config';
import { ArrowRight, Sparkles } from 'lucide-react';

type Step = 'questions' | 'result';

export function QuizFlow() {
  const [step, setStep] = useState<Step>('questions');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUIZ_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === QUIZ_QUESTIONS.length - 1;

  const handleOption = (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (isLastQuestion) {
      setStep('result');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (step === 'result') {
    const result = computeQuizResult(answers);
    return (
      <div className="card-pearl rounded-3xl p-8 md:p-12 space-y-6">
        <div className="flex items-center gap-3 text-accent">
          <Sparkles className="w-8 h-8" aria-hidden />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-body">測驗結果</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-foreground">{result.title}</h2>
        <p className="text-muted-foreground font-body leading-relaxed">{result.description}</p>
        <div className="bg-secondary/50 rounded-2xl p-4">
          <p className="text-foreground font-body text-sm font-medium mb-1">給你的小建議</p>
          <p className="text-muted-foreground font-body text-sm">{result.suggestion}</p>
        </div>
        <p className="text-muted-foreground font-body text-sm">{result.cta}</p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button variant="golden" size="lg" asChild className="group">
            <Link to={ROUTES.BOOKING}>
              預約陪跑
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Button>
          <Button variant="soft" size="lg" asChild>
            <Link to={ROUTES.RESOURCES}>看更多資源</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-pearl rounded-3xl p-8 md:p-12 space-y-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
        <span>第 {currentIndex + 1} / {QUIZ_QUESTIONS.length} 題</span>
      </div>
      <h2 className="font-display text-xl md:text-2xl text-foreground" id={`quiz-q-${question.id}`}>
        {question.question}
      </h2>
      <div role="radiogroup" aria-labelledby={`quiz-q-${question.id}`} className="space-y-3">
        {question.options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant="soft"
            size="lg"
            className="w-full justify-start text-left h-auto py-4 px-4 font-body"
            onClick={() => handleOption(opt.value)}
            aria-pressed={answers[question.id] === opt.value}
            role="radio"
            aria-label={opt.label}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
