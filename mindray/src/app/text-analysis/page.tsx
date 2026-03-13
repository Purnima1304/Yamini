"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface AnalysisResult {
  sentiment: string;
  score: number;
  emotion: string;
  suggestions: string[];
}

export default function TextAnalysisPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        if (data.requiresEmergencyIntervention) {
          setIsEmergencyMode(true);
        } else {
          setResult(data.analysis);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500 bg-emerald-100 border-emerald-200";
    if (score >= 40) return "text-blue-500 bg-blue-100 border-blue-200";
    return "text-rose-500 bg-rose-100 border-rose-200";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <MessageSquare className="text-indigo-500" /> Journal Analyzer
        </h1>
        <p className="text-slate-500 mt-2">Write down your thoughts and let our AI analyze your emotional state to provide personalized coping strategies.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col border-indigo-100 shadow-indigo-500/5 h-full">
          <CardHeader>
            <CardTitle>What's on your mind?</CardTitle>
            <CardDescription>Don't overthink it, just write naturally.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 space-y-4">
            <textarea
              className="flex-1 w-full rounded-2xl border border-slate-200 p-4 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[250px] bg-white/50 backdrop-blur-sm shadow-inner"
              placeholder="I'm feeling a bit overwhelmed today because..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            ></textarea>
            <Button 
              onClick={handleAnalyze} 
              disabled={!text.trim() || loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-12 rounded-xl text-base shadow-lg shadow-indigo-500/25 border-none"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Analyze Journal</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {!result && !loading && !isEmergencyMode && (
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none">
              <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-slate-500 font-medium">Your insights will appear here</h3>
              <p className="text-sm text-slate-400 mt-2">Submit your journal entry to get an AI emotional analysis and recommendations.</p>
            </Card>
          )}

          {loading && (
             <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-indigo-50/50 border-indigo-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4 relative z-10" />
                <h3 className="text-indigo-800 font-medium relative z-10">AI is reading your thoughts...</h3>
             </Card>
          )}

          {result && !loading && !isEmergencyMode && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <Card className="bg-white border-slate-100 shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${getScoreColor(result.score).split(' ')[1]}`}></div>
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Detected Emotion</p>
                       <h3 className="text-3xl font-bold text-slate-900">{result.emotion}</h3>
                     </div>
                     <div className={`px-4 py-2 rounded-xl border font-bold text-lg flex flex-col items-center ${getScoreColor(result.score)}`}>
                       <span>{result.score}/100</span>
                       <span className="text-[10px] uppercase font-bold opacity-80 mt-1 ring-1 ring-black/10 px-1.5 rounded-sm">Score</span>
                     </div>
                   </div>

                   <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                     Overall sentiment is <strong className="capitalize">{result.sentiment}</strong>. The wellness score is calculated based on stress markers, positive affirmations, and emotional intensity.
                   </p>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white/50">
                <CardHeader className="pb-3 border-b border-indigo-100/50">
                  <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {result.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-700 items-start">
                        <span className="bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                     <Button variant="outline" className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => { setResult(null); setText(''); }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Start New Journal
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isEmergencyMode && !loading && (
             <Card className="animate-in slide-in-from-right-8 duration-500 border-rose-200 shadow-2xl shadow-rose-500/20 bg-gradient-to-br from-rose-50 to-white">
               <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40 mb-6 animate-pulse">
                    <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Emergency Contact Alert Triggered</h2>
                  <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                    We detected expressions of severe distress and self-harm in your journal. We care about your safety. 
                    <br /><br />
                    An automated SMS alert has been instantly dispatched to your designated Trusted Emergency Contact to connect with you. Please stay safe and reach out for professional help at <strong>988</strong> immediately.
                  </p>
                  <Button onClick={() => { setIsEmergencyMode(false); setText(''); }} variant="outline" className="w-full border-rose-200 text-rose-700 hover:bg-rose-100 h-12">
                    Acknowledge & Close
                  </Button>
               </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
