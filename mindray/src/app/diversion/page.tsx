"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Music, Video, Pause, PlayCircle, X, Maximize2, MessageCircle, Send, AlertCircle } from "lucide-react";

export default function DiversionPage() {
  // Breathing State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'breathe in' | 'hold' | 'breathe out'>('breathe in');
  const [progress, setProgress] = useState(0);

  // Meditation Timer State
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationTimeLeft, setMeditationTimeLeft] = useState(10 * 60); // 10 minutes
  const meditationAudioRef = useRef<HTMLAudioElement>(null);

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const focusAudioRef = useRef<HTMLAudioElement>(null);

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hi there. I know self-doubt can be incredibly heavy. What's been on your mind today?" }
  ]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      setProgress(0);
      setBreathPhase('breathe in');
      
      const cycleTime = 10000; // 10 seconds total cycle (4s in, 2s hold, 4s out)
      
      const updatePhase = () => {
        const time = Date.now() % cycleTime;
        if (time < 4000) {
          setBreathPhase('breathe in');
          setProgress((time / 4000) * 100);
        } else if (time < 6000) {
          setBreathPhase('hold');
        } else {
          setBreathPhase('breathe out');
          setProgress(100 - ((time - 6000) / 4000) * 100);
        }
      };

      interval = setInterval(updatePhase, 50);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  // Meditation Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMeditating && meditationTimeLeft > 0) {
      if (meditationAudioRef.current && meditationAudioRef.current.paused) {
        meditationAudioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
      timer = setInterval(() => {
        setMeditationTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (!isMeditating || meditationTimeLeft === 0) {
      if (meditationAudioRef.current) {
        meditationAudioRef.current.pause();
      }
      if (meditationTimeLeft === 0) setIsMeditating(false);
    }
    return () => clearInterval(timer);
  }, [isMeditating, meditationTimeLeft]);

  // Focus Mode Effect (DND simulation)
  useEffect(() => {
    if (isFocusMode) {
      if (focusAudioRef.current && focusAudioRef.current.paused) {
        focusAudioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
      document.body.style.overflow = 'hidden'; // Prevent scrolling in focus mode
    } else {
      if (focusAudioRef.current) {
        focusAudioRef.current.pause();
      }
      document.body.style.overflow = 'auto'; // Restore scrolling
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isFocusMode]);

  // Chat Scroll Effect
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatOpen]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isChatLoading) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat-motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      if (data.reply) {
        setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
        if (data.requiresEmergencyIntervention) {
           setIsEmergencyMode(true);
        }
      } else {
        throw new Error("No reply");
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "I'm sorry, I'm having trouble connecting right now. But remember, you are stronger than your doubts." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMeditation = () => {
    if (!isMeditating && meditationTimeLeft === 0) {
      setMeditationTimeLeft(10 * 60); // Reset if finished
    }
    setIsMeditating(!isMeditating);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <audio ref={meditationAudioRef} src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_9b6537eb04.mp3?filename=nature-sounds-birds-114407.mp3" loop />
      <audio ref={focusAudioRef} src="https://cdn.pixabay.com/download/audio/2022/10/25/audio_14ce63e9f4.mp3?filename=deep-focus-study-music-123498.mp3" loop />
      
      {/* Full Screen Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-700">
           <div className="absolute inset-0 bg-blue-900/20 mix-blend-screen opacity-50 animate-pulse"></div>
           <Button 
             variant="ghost" 
             onClick={() => setIsFocusMode(false)}
             className="absolute top-8 right-8 text-slate-400 hover:text-white"
           >
             <X className="w-8 h-8" />
           </Button>
           
           <Music className="w-24 h-24 text-blue-500/50 mb-8 animate-bounce" style={{ animationDuration: '3s' }} />
           <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">Deep Focus Mode</h2>
           <p className="text-xl text-blue-300/80 mb-12">Distractions hidden. Positive vibes flowing. You got this.</p>
           
           <div className="flex gap-4">
               <span className="px-6 py-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 font-medium">
                 Volume {focusAudioRef.current?.paused ? 'Off' : 'On'}
               </span>
               <span className="px-6 py-2 rounded-full border border-blue-900/50 bg-blue-900/20 text-blue-400 font-medium heartbeat">
                 Do Not Disturb Active
               </span>
           </div>
        </div>
      )}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Wind className="text-teal-500" /> Mind Relaxation
        </h1>
        <p className="text-slate-500 mt-2">Take a moment to center yourself with these guided activities.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breathing Exercise */}
        <Card className="lg:row-span-2 border-teal-100 shadow-teal-500/5 bg-gradient-to-br from-teal-50 to-white overflow-hidden flex flex-col items-center py-12 px-6 text-center">
           <h2 className="text-2xl font-bold text-teal-900 mb-2">Guided Breathing</h2>
           <p className="text-teal-700 mb-12">Box breathing technique to calm your nervous system</p>
           
           <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
             <div className="absolute inset-0 bg-teal-200 rounded-full opacity-20"></div>
             <div 
               className="absolute bg-gradient-to-t from-teal-400 to-emerald-400 rounded-full shadow-lg transition-all duration-[50ms] ease-linear flex items-center justify-center text-white font-bold text-2xl"
               style={{ 
                 width: isBreathing ? `${50 + progress / 2}%` : '50%', 
                 height: isBreathing ? `${50 + progress / 2}%` : '50%',
                 opacity: isBreathing && breathPhase === 'hold' ? 0.8 : 1
               }}
             >
                {isBreathing && breathPhase}
             </div>
           </div>

           <Button 
             onClick={() => setIsBreathing(!isBreathing)} 
             className={`w-48 rounded-full h-14 text-lg shadow-xl shrink-0 ${
               isBreathing ? 'bg-slate-900 hover:bg-slate-800' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
             }`}
           >
             {isBreathing ? (
               <><Pause className="mr-2" /> Stop Exercise</>
             ) : (
               <><Play className="mr-2" /> Start Breathing</>
             )}
           </Button>
        </Card>

        {/* Media Cards */}
        <div className="space-y-6">
          <Card className={`group hover:border-purple-300 transition-all duration-300 border-purple-100 cursor-pointer overflow-hidden relative ${isMeditating ? 'bg-purple-100 shadow-xl shadow-purple-500/10 ring-2 ring-purple-400 scale-[1.02]' : 'bg-purple-50/50'}`}>
            <div className={`absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-200 to-transparent ${isMeditating ? 'opacity-100' : 'opacity-50'}`}></div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <PlayCircle className={`w-8 h-8 ${isMeditating ? 'text-purple-600 animate-pulse' : 'text-purple-400 group-hover:text-purple-600'}`} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-700 transition-colors">10-Min Morning Meditation</h3>
                   <p className="text-slate-500 text-sm mt-1">
                     {isMeditating ? (
                       <span className="text-purple-700 font-medium animate-pulse">Now playing calm nature sounds...</span>
                     ) : (
                       "Start your day with intention and gratitude."
                     )}
                   </p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                  {isMeditating && (
                    <span className="text-2xl tracking-widest font-mono font-bold text-purple-700 bg-white/50 px-4 py-1.5 rounded-xl border border-purple-200 shadow-sm">
                      {formatTime(meditationTimeLeft)}
                    </span>
                  )}
                  <Button 
                    onClick={toggleMeditation}
                    variant={isMeditating ? "default" : "outline"} 
                    className={`rounded-full shrink-0 ${isMeditating ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25' : 'border-purple-200 text-purple-700 hover:bg-purple-100'}`}
                  >
                     {isMeditating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                     {isMeditating ? 'Pause' : 'Start'}
                  </Button>
               </div>
            </CardContent>
          </Card>

          <Card onClick={() => setIsFocusMode(true)} className="group hover:border-blue-300 transition-colors border-blue-100 bg-blue-50/50 cursor-pointer overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-200 to-transparent opacity-50"></div>
            <CardContent className="p-6 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Maximize2 className="w-8 h-8 text-blue-600" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">Deep Focus Ambience</h3>
                   <p className="text-slate-500 text-sm mt-1">Blocks distractions with DND overlay & binaural beats.</p>
                 </div>
               </div>
               <Button variant="ghost" className="rounded-full shrink-0 text-blue-600 group-hover:bg-blue-100">
                  Enter Mode
               </Button>
            </CardContent>
          </Card>

          <Card onClick={() => setIsChatOpen(true)} className="group hover:border-rose-300 transition-colors border-rose-100 bg-rose-50/50 cursor-pointer overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-rose-200 to-transparent opacity-50"></div>
            <CardContent className="p-6 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden">
                    <MessageCircle className="w-8 h-8 text-rose-600 relative z-10" />
                    <div className="absolute inset-0 bg-rose-200/50"></div>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-700 transition-colors">Overcoming Self-Doubt AI</h3>
                   <p className="text-slate-500 text-sm mt-1">Interactive coaching session to reframe negative thoughts.</p>
                 </div>
               </div>
               <Button variant="ghost" className="rounded-full shrink-0 text-rose-600 group-hover:bg-rose-100">
                  Chat Now
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chat Dialog Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${isEmergencyMode ? 'bg-rose-600' : 'bg-rose-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm ${isEmergencyMode ? 'text-rose-600' : 'text-rose-500'}`}>
                  {isEmergencyMode ? <AlertCircle className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isEmergencyMode ? 'text-white' : 'text-slate-800'}`}>Motivation Coach</h3>
                  <p className={`text-xs flex items-center gap-1 ${isEmergencyMode ? 'text-rose-100' : 'text-slate-500'}`}>
                    <span className={`w-2 h-2 rounded-full inline-block ${isEmergencyMode ? 'bg-red-400 animate-ping' : 'bg-emerald-500'}`}></span> {isEmergencyMode ? 'System Alert' : 'Online'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsChatOpen(false); setIsEmergencyMode(false); }} className={`rounded-full hover:bg-white/20 ${isEmergencyMode ? 'text-white hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isEmergencyMode ? (
              <div className="flex-1 overflow-y-auto p-8 bg-rose-50 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40 mb-6 animate-pulse">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Emergency Contact Alert Triggered</h2>
                <p className="text-slate-600 mb-6 font-medium leading-relaxed max-w-sm">
                  We detected expressions of severe distress and self-harm in your chat. We care about your safety. 
                  <br /><br />
                  An automated SMS alert has been instantly dispatched to your designated Trusted Emergency Contact to connect with you. Please stay safe and reach out for professional help at <strong>988</strong> immediately.
                </p>
                <Button onClick={() => setIsEmergencyMode(false)} variant="outline" className="w-full max-w-xs border-rose-200 text-rose-700 hover:bg-rose-100 h-12">
                  Return to Chat
                </Button>
              </div>
            ) : (
              <>
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50" ref={chatScrollRef}>
                  <div className="text-center pb-4">
                    <p className="text-xs text-slate-400 font-medium bg-slate-100/50 inline-block px-3 py-1 rounded-full border border-slate-100">Secure AI Coaching Session</p>
                  </div>
                  
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20' 
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl px-5 py-3 bg-white border border-slate-200 text-slate-800 shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Share what's on your mind..."
                      className="w-full bg-slate-100/50 border border-slate-200 rounded-full pl-6 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 disabled:opacity-50"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isChatLoading}
                      autoFocus
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || isChatLoading}
                      size="icon"
                      className="absolute right-1.5 h-auto py-2 px-3 rounded-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
