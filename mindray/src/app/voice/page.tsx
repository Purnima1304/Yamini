"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Activity } from "lucide-react";

// Add declaration for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceAnalysis {
  emotion: string;
  confidence: number;
  transcript_duration_seconds: number;
}

export default function VoiceEmotionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceAnalysis | null>(null);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setTranscript(prev => prev + transcriptPart + ' ');
            } else {
              currentTranscript += transcriptPart;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
          setError("Microphone error or not allowed. Please check permissions.");
        };
      } else {
        setError("Speech Recognition API is not supported in this browser. Please use Chrome or Edge.");
      }
    }
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setError('');
    setTranscript('');
    setResult(null);
    setIsRecording(true);
    try {
       recognitionRef.current.start();
    } catch(e) {
       console.error(e);
       setError("Something went wrong starting the microphone.");
       setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    setIsRecording(false);
    recognitionRef.current.stop();
  };

  const analyzeAudio = async () => {
    if (!transcript.trim()) {
       setError("No speech detected to analyze.");
       return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.analysis);
      } else {
        setError(data.error);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to analyze voice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Mic className="text-rose-500" /> Voice Emotion Detector
        </h1>
        <p className="text-slate-500 mt-2">Speak your thoughts aloud. Our AI analyzes not just what you say, but how you feel based on the text context and pacing.</p>
      </header>

      {error && (
         <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-sm animate-in slide-in-from-top-4">
            {error}
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-rose-100 shadow-rose-500/5 h-full relative overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Record Voice Note</CardTitle>
            <CardDescription>Click the microphone to start.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center flex-1 justify-center space-y-8 z-10 relative">
            <div className="relative">
              {isRecording && (
                <>
                  <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20 scale-150"></div>
                  <div className="absolute inset-0 bg-rose-400 rounded-full animate-pulse opacity-40 scale-125 duration-1000"></div>
                </>
              )}
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative z-10 ${
                  isRecording 
                    ? 'bg-rose-600 text-white hover:bg-rose-700 scale-105 shadow-rose-500/50' 
                    : 'bg-gradient-to-br from-white to-rose-50 text-rose-500 hover:shadow-2xl border-2 border-rose-100'
                }`}
              >
                {isRecording ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-12 h-12" />}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700 h-6">
                {isRecording ? "Listening..." : "Ready to record"}
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-[100px] text-slate-600 text-sm italic relative">
               {transcript || "Your speech will appear here..."}
               {isRecording && <span className="animate-pulse ml-1 text-rose-500 inline-block">|</span>}
            </div>

            <Button 
              onClick={analyzeAudio} 
              disabled={isRecording || loading || !transcript.trim()}
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Activity className="w-5 h-5 mr-2" />}
              Analyze Emotion
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {!result && !loading && (
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none">
              <Activity className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-slate-500 font-medium">Emotion analysis pending</h3>
              <p className="text-sm text-slate-400 mt-2">Finish recording and click 'Analyze Emotion' to see results.</p>
            </Card>
          )}

          {loading && (
             <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 border-rose-100">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                <h3 className="text-rose-800 font-medium">Processing Audio Signature...</h3>
             </Card>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <Card className="bg-gradient-to-br from-rose-500 to-orange-500 text-white border-none shadow-xl shadow-rose-500/20">
                <CardContent className="p-8 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 opacity-10">
                     <Activity className="w-48 h-48 -mr-12 -mt-12" />
                   </div>
                   <p className="text-white/80 uppercase tracking-widest text-xs font-bold mb-2">Detected Primary Emotion</p>
                   <h2 className="text-6xl font-bold mb-4">{result.emotion}</h2>
                   <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-sm font-medium">
                      <span>Confidence Score:</span>
                      <strong className="text-lg">{result.confidence}%</strong>
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-800 text-lg">Audio Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium text-sm">Estimated Duration</span>
                    <span className="text-slate-900 font-bold">{result.transcript_duration_seconds} seconds</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium text-sm">Word Count</span>
                    <span className="text-slate-900 font-bold">{transcript.trim().split(/\s+/).length} words</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <p className="text-sm text-slate-600">This mock analysis uses text cues from the transcribed speech. In a full production app, you would process the raw audio file to detect acoustic features like pitch, tone, and pacing.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
