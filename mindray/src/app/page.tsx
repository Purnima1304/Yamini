import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, BookOpen, Wind, Phone, Activity, ChevronRight, Sparkles, Coffee, Mic } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let user: any = { name: 'User' };
  
  let todaysMood: any = null;
  let latestJournal: any = null;
  let journalCount = 0;
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        if (payload && payload.id) {
           user = payload;
           const db = await getDb();
           todaysMood = await db.get(`SELECT * FROM moods WHERE user_id = ? AND date(created_at) = date('now') ORDER BY created_at DESC LIMIT 1`, [user.id]);
           latestJournal = await db.get(`SELECT * FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`, [user.id]);
           const countResult = await db.get(`SELECT COUNT(*) as count FROM journals WHERE user_id = ?`, [user.id]);
           journalCount = countResult?.count || 0;
        } else if (payload && payload.email) {
           user = { ...payload, name: payload.email.split('@')[0] };
        }
      }
    } catch(e) {}
  }

  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  let stressLevel = null;
  if (latestJournal) {
    stressLevel = 100 - latestJournal.score;
  }

  const moodEmojis: Record<string, string> = {
    Happy: '😊',
    Neutral: '😐',
    Sad: '😢',
    Anxious: '😰'
  };

  const quotes = [
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese Proverb" },
    { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
    { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" }
  ];
  
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const quoteIndex = dayOfYear % quotes.length;
  const dailyQuote = quotes[quoteIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Good morning, {firstName} <span className="text-2xl">⛅</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Link href="/mood" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 shrink-0 shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none">
            <Smile className="w-4 h-4 mr-2" /> Log Today's Mood
          </Link>
          <Link href="/text-analysis" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-white/50 text-slate-900 shadow-sm hover:bg-white/70 backdrop-blur-md border border-white/40 shrink-0">
            <BookOpen className="w-4 h-4 mr-2" /> Write Journal
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Stats) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-purple-500 border-none text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <Smile className="w-24 h-24 text-white" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="font-medium text-white/80 uppercase tracking-wider text-xs mb-2">Today's Mood</p>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-4xl">{todaysMood ? moodEmojis[todaysMood.mood] || '😐' : '—'}</span>
                  <div>
                    <h3 className="text-4xl font-bold">{todaysMood ? `${todaysMood.intensity}/10` : '—'}</h3>
                    <p className="text-white/90 font-medium">{todaysMood ? todaysMood.mood : 'No entry yet'}</p>
                  </div>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mb-3 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: todaysMood ? `${todaysMood.intensity * 10}%` : '0%' }}></div>
                </div>
                {todaysMood?.note && (
                  <p className="text-sm border-t border-white/20 pt-3 mt-4 text-white/90 italic">
                    "{todaysMood.note}"
                  </p>
                )}
                {!todaysMood?.note && todaysMood && (
                  <p className="text-sm border-t border-white/20 pt-3 mt-4 text-white/90">
                    Logged today via Mood Tracker
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="flex-1">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-medium text-slate-500 uppercase tracking-wider text-xs">Stress Level</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{stressLevel !== null ? `${stressLevel}%` : '--'}</h3>
                    <p className="text-slate-400 font-medium text-sm mt-1">{stressLevel !== null ? 'Based on latest journal' : 'Not Calibrated'}</p>
                  </div>
                  <div className="w-full flex h-2 rounded-full overflow-hidden mt-6 bg-slate-100">
                     <div className={`h-full rounded-full relative transition-all duration-1000 ${stressLevel !== null && stressLevel > 50 ? 'bg-orange-400' : 'bg-blue-400'}`} style={{ width: stressLevel !== null ? `${stressLevel}%` : '0%' }}>
                     </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-1">
                 <CardContent className="p-6 h-full flex flex-col justify-center relative overflow-hidden">
                   <div className="absolute -right-4 -bottom-4 bg-orange-100 w-24 h-24 rounded-full opacity-50 blur-2xl"></div>
                   <div className="flex justify-between items-start mb-2 relative z-10">
                    <p className="font-medium text-slate-500 uppercase tracking-wider text-xs">Journal Streak</p>
                    <span className="text-orange-500">🔥</span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{journalCount === 0 ? '1st' : journalCount} <span className="text-lg text-slate-500 font-medium">{journalCount === 0 ? 'day' : 'entries'}</span></h3>
                    <div className="flex gap-1 mt-4">
                       {[...Array(7)].map((_, i) => (
                         <div key={i} className={`h-2 flex-1 rounded-full ${i < (journalCount === 0 ? 1 : Math.min(journalCount, 7)) ? 'bg-orange-400' : 'bg-slate-200'}`}></div>
                       ))}
                    </div>
                  </div>
                 </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-slate-800">Quick Activities</h3>
                <Link href="/diversion" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/mbti" className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-colors text-purple-700 text-center border border-purple-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className="font-medium text-sm text-slate-900">MBTI Test</span>
                </Link>
                <Link href="/diversion" className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors text-blue-700 text-center border border-blue-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Wind className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="font-medium text-sm text-slate-900">Breathe</span>
                </Link>
                <Link href="/text-analysis" className="flex flex-col items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 rounded-2xl transition-colors text-teal-700 text-center border border-teal-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <BookOpen className="w-6 h-6 text-teal-500" />
                  </div>
                  <span className="font-medium text-sm text-slate-900">Journal</span>
                </Link>
                <Link href="/voice" className="flex flex-col items-center justify-center p-4 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors text-rose-700 text-center border border-rose-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Mic className="w-6 h-6 text-rose-500" />
                  </div>
                  <span className="font-medium text-sm text-slate-900">Voice Note</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="font-semibold text-sm text-indigo-900 flex items-center uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 mr-2" /> Daily Inspiration
                </p>
                <span className="text-xs text-indigo-400 font-medium">{quoteIndex + 1}/{quotes.length}</span>
              </div>
              <div className="mb-6 flex justify-center">
                 <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                   <Coffee className="w-8 h-8 text-orange-400" />
                 </div>
              </div>
              <p className="text-indigo-900 font-medium text-center text-lg leading-relaxed italic mb-4">
                "{dailyQuote.text}"
              </p>
              <p className="text-center text-indigo-500 text-sm font-semibold">— {dailyQuote.author}</p>
              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1 bg-white border-indigo-200 hover:bg-indigo-50">Share</Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">Next →</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
               <h3 className="font-semibold text-slate-800 mb-6 flex items-center">
                 Next Appointment
               </h3>
               <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-4 items-center relative overflow-hidden">
                 <div className="w-1 absolute left-0 top-0 bottom-0 bg-blue-500"></div>
                 <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex justify-center items-center font-bold text-lg shrink-0">
                    A
                 </div>
                 <div>
                    <h4 className="font-semibold text-slate-900">Dr. Ananya Patel</h4>
                    <p className="text-xs text-blue-600 font-medium mb-1">Cognitive Behavioral Therapy</p>
                    <p className="text-xs text-slate-500 flex items-center">
                       <Activity className="w-3 h-3 mr-1" /> Mar 15, 2026 • 10:00 AM
                    </p>
                 </div>
               </div>
               <Button className="w-full mt-4" variant="outline">Manage Appointment</Button>
            </CardContent>
          </Card>

           <Card>
            <CardContent className="p-6 bg-rose-50 border-rose-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Phone className="w-6 h-6 text-rose-500" />
                  </div>
               <h3 className="font-semibold text-rose-900 mb-2">Need immediate help?</h3>
               <p className="text-sm text-rose-700 mb-4">Reach out to a crisis counselor 24/7.</p>
               <Link href="/emergency" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-500 text-white hover:bg-red-600 w-full mt-2">
                 Emergency Resources
               </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
