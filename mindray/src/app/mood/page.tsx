"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Frown, Meh, Wind, Calendar as CalendarIcon, Loader2 } from "lucide-react";

type MoodType = 'Happy' | 'Neutral' | 'Sad' | 'Anxious';

interface MoodEntry {
  id: number;
  date: string;
  mood: MoodType;
  intensity: number;
  note: string;
}

const moodConfig: Record<MoodType, { icon: React.ReactNode, color: string, bg: string }> = {
  Happy: { icon: <Smile className="w-8 h-8" />, color: "text-emerald-500", bg: "bg-emerald-100 border-emerald-200" },
  Neutral: { icon: <Meh className="w-8 h-8" />, color: "text-blue-500", bg: "bg-blue-100 border-blue-200" },
  Sad: { icon: <Frown className="w-8 h-8" />, color: "text-indigo-500", bg: "bg-indigo-100 border-indigo-200" },
  Anxious: { icon: <Wind className="w-8 h-8" />, color: "text-orange-500", bg: "bg-orange-100 border-orange-200" },
};

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mood')
      .then(r => r.json())
      .then(d => {
        if(d.history) setHistory(d.history);
        setInitLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setLoading(true);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, intensity, note })
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        setSelectedMood(null);
        setIntensity(5);
        setNote('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Smile className="text-blue-500" /> Daily Mood Tracker
        </h1>
        <p className="text-slate-500 mt-2">Log your emotions to recognize patterns and take control of your mental health.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Log Form */}
        <Card className="border-blue-100 shadow-blue-500/5">
          <CardHeader>
            <CardTitle>How are you feeling?</CardTitle>
            <CardDescription>Select the mood that best matches your current state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(moodConfig) as MoodType[]).map((mood) => {
                const isSelected = selectedMood === mood;
                const config = moodConfig[mood];
                return (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 border-2 ${
                      isSelected ? `${config.bg} ${config.color}` : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm'
                    }`}
                  >
                    {config.icon}
                    <span className="font-medium text-sm mt-3">{mood}</span>
                  </button>
                )
              })}
            </div>

            {selectedMood && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex justify-between">
                    Intensity 
                    <span className="font-bold text-blue-600">{intensity}/10</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={intensity} 
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Mild</span>
                    <span>Strong</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Add a note (optional)</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Why are you feeling this way?"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 bg-white/50"
                  ></textarea>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-base shadow-lg shadow-blue-500/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Log'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="bg-gradient-to-br from-slate-50 to-white/50 border-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-400" /> Recent Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : history.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No moods logged yet.</p>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => {
                  const config = moodConfig[entry.mood];
                  const date = new Date(entry.date);
                  return (
                    <div key={entry.id} className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex gap-4 items-start">
                      <div className={`p-3 rounded-xl ${config.bg} ${config.color} shrink-0`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-slate-900">{entry.mood}</h4>
                          <span className="text-xs font-medium text-slate-400">
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mb-2">Intensity: {entry.intensity}/10</p>
                        {entry.note && (
                          <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic">"{entry.note}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
