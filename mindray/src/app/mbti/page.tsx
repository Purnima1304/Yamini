"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, CheckCircle2 } from "lucide-react";
import Link from 'next/link';

const questions = [
  {
    id: 1,
    text: "You regularly make new friends.",
    options: [
      { value: "A", label: "Often, I enjoy networking and meeting new people" },
      { value: "B", label: "Rarely, I prefer my small circle of close friends" },
    ]
  },
  {
    id: 2,
    text: "At social events, you rarely try to introduce yourself to new people and mostly talk to the ones you already know.",
    options: [
      { value: "A", label: "Accurate, I stick to my group" },
      { value: "B", label: "Inaccurate, I mingle" },
    ]
  },
  {
    id: 3,
    text: "You prefer to be fully prepared before starting a task.",
    options: [
      { value: "A", label: "Yes, planning is essential" },
      { value: "B", label: "No, I like to wing it and adapt" },
    ]
  },
  {
    id: 4,
    text: "When making a decision, you rely more on...",
    options: [
      { value: "A", label: "Logic and facts" },
      { value: "B", label: "Emotions and feelings" },
    ]
  },
  {
    id: 5,
    text: "You often spend time exploring unrealistic yet intriguing ideas.",
    options: [
      { value: "A", label: "Very true, I love daydreaming concepts" },
      { value: "B", label: "Not really, I stay grounded in reality" },
    ]
  },
  {
    id: 6,
    text: "You prefer a cozy night in rather than a night out.",
    options: [
      { value: "A", label: "Absolutely" },
      { value: "B", label: "Sometimes" },
    ]
  },
  {
    id: 7,
    text: "Deadlines seem to you to be of relative, rather than absolute, importance.",
    options: [
      { value: "A", label: "Agree, flexibility is key" },
      { value: "B", label: "Disagree, deadlines are hard rules" },
    ]
  },
  {
    id: 8,
    text: "You are more of a detail-oriented than a big picture person.",
    options: [
      { value: "A", label: "Detail-oriented" },
      { value: "B", label: "Big picture" },
    ]
  },
  {
    id: 9,
    text: "Your mood can change very quickly.",
    options: [
      { value: "A", label: "Yes, quite often" },
      { value: "B", label: "No, I am generally stable" },
    ]
  },
  {
    id: 10,
    text: "You usually find it difficult to relax when talking in front of many people.",
    options: [
      { value: "A", label: "Yes, public speaking is scary" },
      { value: "B", label: "No, I feel energized by crowds" },
    ]
  }
];

export default function MBTITestPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string, description: string } | null>(null);

  const handleSelect = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = val;
    setAnswers(newAnswers);
  };

  const currentQ = questions[currentStep];
  const isLast = currentStep === questions.length - 1;
  const canProceed = answers[currentStep] !== '';

  const handleNext = async () => {
    if (!isLast) {
      setCurrentStep(s => s + 1);
    } else {
      // Submit
      setLoading(true);
      try {
        const res = await fetch('/api/mbti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        });
        const data = await res.json();
        if (data.success) {
          setResult(data.result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
        <Link href="/">
           <Button variant="ghost" className="mb-6"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button>
        </Link>
        <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
          <CardContent className="pt-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
              <BrainCircuit className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-2">Your Personality Profile</h2>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">{result.type}</h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 border-t border-purple-200 pt-8">
              {result.description}
            </p>
            <div className="flex justify-center gap-4">
               <Link href="/diversion">
                 <Button className="bg-purple-600 hover:bg-purple-700">Explore Activities for You</Button>
               </Link>
               <Button variant="outline" onClick={() => { setResult(null); setCurrentStep(0); setAnswers(Array(10).fill('')); }}>
                 Retake Test
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <BrainCircuit className="text-purple-500" /> Personality Assessment
           </h1>
           <p className="text-slate-500 mt-2">Discover insights about how you perceive the world and make decisions.</p>
        </div>
        <div className="text-right">
           <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wide">
             Question {currentStep + 1} of 10
           </span>
        </div>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${((currentStep) / 10) * 100}%` }}
        ></div>
      </div>

      <Card className="min-h-[400px] flex flex-col pt-6">
        <CardContent className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
           <h2 className="text-2xl font-semibold text-slate-800 text-center mb-12 leading-relaxed">
             "{currentQ.text}"
           </h2>
           
           <div className="space-y-4">
             {currentQ.options.map((opt) => {
               const isSelected = answers[currentStep] === opt.value;
               return (
                 <button
                   key={opt.value}
                   onClick={() => handleSelect(opt.value)}
                   className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                     isSelected 
                       ? 'border-purple-500 bg-purple-50 text-purple-900' 
                       : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50 text-slate-700'
                   }`}
                 >
                   <span className="font-medium">{opt.label}</span>
                   {isSelected && <CheckCircle2 className="text-purple-600 animate-in zoom-in duration-200" />}
                 </button>
               );
             })}
           </div>
        </CardContent>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center mt-auto">
           <Button 
             variant="ghost" 
             onClick={handlePrev} 
             disabled={currentStep === 0 || loading}
           >
             <ArrowLeft className="w-4 h-4 mr-2" /> Previous
           </Button>
           
           <Button 
             onClick={handleNext} 
             disabled={!canProceed || loading}
             className="bg-slate-900 text-white px-8"
           >
             {loading ? 'Processing...' : (isLast ? 'See Results' : 'Next Question')}
           </Button>
        </div>
      </Card>
    </div>
  );
}
