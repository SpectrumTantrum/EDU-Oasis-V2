"use client";

import { useState, useEffect } from "react";
import { Puzzle, Check, X, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";
import type { QuizQuestion } from "@/rag/types";

export function QuizPanel({ onClose }: { onClose: () => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const { selectedConceptId, knowledgeGraph, currentAction, sessionParams, pushEvent } = useFocusFlowStore();
  const targetConceptId = selectedConceptId ?? currentAction?.next_concept_id ?? "general";
  const concept = knowledgeGraph?.concepts.find((c) => c.concept_id === targetConceptId);
  const conceptName = concept?.name ?? targetConceptId ?? "general";
  const adaptiveDifficulty = currentAction?.difficulty
    ?? (sessionParams?.difficulty_bias === "harder"
      ? "hard"
      : sessionParams?.difficulty_bias === "easier"
        ? "easy"
        : "medium");
  const questionCount = currentAction?.chunk_size === "long" ? 4 : currentAction?.chunk_size === "short" ? 2 : 3;

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concept_id: targetConceptId,
            concept_name: conceptName,
            difficulty: adaptiveDifficulty,
            count: questionCount,
          }),
        });
        const data = await res.json();
        setQuestions(data.questions ?? []);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [targetConceptId, conceptName, adaptiveDifficulty, questionCount]);

  const handleSubmit = () => {
    if (selected === null || !questions[currentQ]) return;
    const correct = selected === questions[currentQ].correct_index;
    setShowFeedback(true);
    if (correct) setScore((s) => s + 1);

    // Push event to adaptive engine
    if (targetConceptId) {
      pushEvent(
        correct
          ? { type: "quiz_correct", concept_id: targetConceptId, difficulty: questions[currentQ].difficulty }
          : { type: "quiz_incorrect", concept_id: targetConceptId }
      );
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (currentQ < questions.length - 1) setCurrentQ((q) => q + 1);
    }, 1800);
  };

  const isComplete = currentQ >= questions.length - 1 && showFeedback;
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Card className="p-6 rounded-xl max-w-lg mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3">Generating quiz for &ldquo;{conceptName}&rdquo;...</span>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-6 rounded-xl max-w-lg mx-auto text-center">
        <p>No quiz questions available. Try uploading content first.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </Card>
    );
  }

  const q = questions[currentQ];

  return (
    <Card className="p-6 rounded-xl max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Puzzle className="w-5 h-5" /> Quiz: {conceptName}
        </h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200 text-xl">&times;</button>
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        Adaptive difficulty: <span className="font-medium capitalize">{adaptiveDifficulty}</span> · Questions: {questionCount}
      </p>
      <Progress value={progress} className="h-2 mb-6" />

      {!isComplete ? (
        <div className="space-y-4">
          <p className="font-medium">Q{currentQ + 1}/{questions.length}: {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let cls = "p-3 rounded-md border cursor-pointer transition-colors text-sm ";
              if (showFeedback) {
                if (i === q.correct_index) cls += "border-green-500 bg-green-50 dark:bg-green-900/30";
                else if (i === selected) cls += "border-red-500 bg-red-50 dark:bg-red-900/30";
                else cls += "border-neutral-200 dark:border-neutral-700 opacity-50";
              } else if (i === selected) {
                cls += "border-blue-500 bg-blue-50 dark:bg-blue-900/30";
              } else {
                cls += "border-neutral-200 dark:border-neutral-700 hover:border-blue-300";
              }
              return (
                <div key={i} className={cls} onClick={() => !showFeedback && setSelected(i)}>
                  <span className="flex items-center gap-2">
                    {showFeedback && i === q.correct_index && <Check className="w-4 h-4 text-green-500" />}
                    {showFeedback && i === selected && i !== q.correct_index && <X className="w-4 h-4 text-red-500" />}
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
          <Button onClick={handleSubmit} disabled={selected === null || showFeedback} className="w-full">
            Submit Answer
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h4 className="text-xl font-semibold mb-2">Quiz Complete!</h4>
          <p className="text-lg mb-4">Score: {score}/{questions.length}</p>
          <p className="text-sm text-neutral-500 mb-6">
            {score === questions.length ? "Perfect! You have mastered this concept!" : score >= questions.length / 2 ? "Good work! Keep practicing." : "Keep studying, you will get there!"}
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </Card>
  );
}
