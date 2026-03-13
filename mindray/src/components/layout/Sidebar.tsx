import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Smile, MessageSquare, Mic, PlaySquare, HeartPulse, GraduationCap, Calendar, LogOut, Brain } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };
  const links = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/mood', label: 'Mood Tracker', icon: Smile },
    { href: '/mbti', label: 'Personality (MBTI)', icon: Brain },
    { href: '/text-analysis', label: 'Journal Analyzer', icon: MessageSquare },
    { href: '/voice', label: 'Voice Emotion', icon: Mic },
    { href: '/diversion', label: 'Mind Relaxation', icon: PlaySquare },
  ];

  const supportLinks = [
    { href: '/psychiatrist', label: 'Psychiatrists', icon: GraduationCap },
    { href: '/book-appointment', label: 'Appointments', icon: Calendar },
    { href: '/emergency', label: 'Emergency Help', icon: HeartPulse, danger: true },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-slate-200 bg-white/50 backdrop-blur-xl flex flex-col z-40 dark:bg-slate-900/50 dark:border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          <Smile className="w-8 h-8 text-blue-600" />
          MindRay
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        <div>
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Modules</p>
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Support</p>
          <nav className="space-y-1">
            {supportLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400'
                      : link.danger 
                        ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20' 
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : link.danger ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-white/20 dark:border-slate-800/50">
        <div className="mt-8 border-t border-indigo-100 pt-4 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0 uppercase">
             {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
           </div>
           <div className="flex-1 overflow-hidden">
             <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
             <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors p-2" title="Logout">
             <LogOut className="w-4 h-4" />
           </button>
        </div>
      </div>
    </aside>
  );
}
