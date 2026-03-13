"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Smile, LockOpen, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const isSignup = activeTab === 'signup';
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/signin';
      const body = isSignup ? { name, email, password, emergencyContact } : { email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
         router.push('/');
         router.refresh(); // Refresh to ensure middleware catches the new cookie
         // Note: We deliberately don't set loading to false here to prevent rapid UI flashing as next.js navigates
      } else {
         setError(data.error || 'Authentication failed. Please check your credentials.');
         setLoading(false);
      }
    } catch(e) {
      console.error(e);
      setError('A network error occurred. Please try again later.');
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white animate-in fade-in duration-500">
      
      {/* Left Split: Branding & Story (Hidden on small mobile, visible on md+) */}
      <div className="hidden md:flex md:w-1/2 bg-mindray-gradient p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -mb-20 -ml-20"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
               <Smile className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-wide">MindRay</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Track Your Mind.<br />Heal Your Life.
          </h1>
          <p className="text-white/90 text-xl font-medium max-w-md leading-relaxed mb-12">
            Your personal AI-powered mental wellness companion. Log moods, analyze emotions, and connect with professional support — all in one calming space.
          </p>

          <div className="flex flex-wrap gap-3 max-w-md mb-12">
            {['😊 Mood Tracking', '✍️ Journal Analysis', '🧘 Mindfulness', '👨‍⚕️ Expert Support', '🎤 Voice Emotion', '📊 Insights'].map(tag => (
               <span key={tag} className="px-4 py-2 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 font-medium text-sm shadow-sm">
                 {tag}
               </span>
            ))}
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 glass rounded-3xl p-6 max-w-lg mb-8 text-white">
           <p className="italic text-lg mb-6 leading-relaxed">
             "MindRay helped me recognize my anxiety patterns and finally take control of my mental health. The daily mood tracker is a game-changer."
           </p>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold">
                    PK
                 </div>
                 <div>
                    <h4 className="font-bold">Priya Krishnamurthy</h4>
                    <p className="text-xs text-white/80">Using MindRay for 4 months</p>
                 </div>
              </div>
              <div className="flex gap-1">
                 {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
           </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-12 text-white">
           <div>
             <h3 className="text-3xl font-bold">50K+</h3>
             <p className="text-sm text-white/80 font-medium">Active Users</p>
           </div>
           <div>
             <h3 className="text-3xl font-bold flex items-center gap-1">4.9 <StarIcon /></h3>
             <p className="text-sm text-white/80 font-medium">App Rating</p>
           </div>
           <div>
             <h3 className="text-3xl font-bold">2M+</h3>
             <p className="text-sm text-white/80 font-medium">Mood Entries</p>
           </div>
        </div>
      </div>

      {/* Right Split: Auth Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative bg-white dark:bg-slate-950">
         
         <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo (visible only on sm) */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                 <Smile className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white">MindRay</span>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100/80 dark:bg-slate-900 rounded-full mb-10 border border-slate-200 dark:border-slate-800">
               <button 
                 onClick={() => setActiveTab('signin')}
                 className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                   activeTab === 'signin' 
                     ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                 }`}
               >
                 Sign In
               </button>
               <button 
                 onClick={() => setActiveTab('signup')}
                 className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                   activeTab === 'signup' 
                     ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                 }`}
               >
                 Create Account
               </button>
            </div>

            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                 {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
               </h2>
               <p className="text-slate-500 dark:text-slate-400">
                 {activeTab === 'signin' 
                   ? 'Sign in to continue your wellness journey' 
                   : 'Start your mental wellness journey today'}
               </p>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-14 rounded-full border-slate-200 dark:border-slate-800 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 mb-8"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {activeTab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
            </Button>

            <div className="relative flex items-center py-5 mb-4">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or with email</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
               {activeTab === 'signup' && (
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
                   <Input 
                     type="text" 
                     required 
                     placeholder="Sarah Johnson" 
                     className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
                     value={name}
                     onChange={e => setName(e.target.value)}
                   />
                 </div>
               )}
               
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
                 <Input 
                   type="email" 
                   required 
                   placeholder={activeTab === 'signin' ? "sarah@mindray.app" : "you@example.com"}
                   className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                   {activeTab === 'signin' && (
                     <a href="#" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Forgot password?</a>
                   )}
                 </div>
                 <Input 
                   type="password" 
                   required 
                   placeholder={activeTab === 'signin' ? "••••••••" : "Create a strong password"}
                   className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                 />
               </div>

               {activeTab === 'signup' && (
                 <>
                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm password</label>
                     <Input 
                       type="password" 
                       required 
                       placeholder="Repeat your password"
                       className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
                     />
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Emergency Contact</label>
                       <span className="text-xs text-slate-400">Required</span>
                     </div>
                     <Input 
                       type="text" 
                       required 
                       placeholder="Parent or close friend's number"
                       className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
                       value={emergencyContact}
                       onChange={e => setEmergencyContact(e.target.value)}
                     />
                     <p className="text-xs text-slate-500">We'll provide this number on your Emergency Help screen for quick access.</p>
                   </div>
                 </>
               )}

               <div className="flex items-center pt-2">
                 <input 
                   type="checkbox" 
                   id="terms" 
                   className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                 />
                 <label htmlFor="terms" className="ml-3 text-sm text-slate-600 dark:text-slate-400">
                   {activeTab === 'signin' ? (
                     'Keep me signed in for 30 days'
                   ) : (
                     <span>I agree to MindRay's <a href="#" className="text-blue-600 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 font-medium">Privacy Policy</a>.</span>
                   )}
                 </label>
               </div>

               <Button 
                 type="submit" 
                 disabled={loading}
                 className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold shadow-lg shadow-blue-500/25 mt-4"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                   activeTab === 'signin' ? (
                     <span className="flex items-center justify-center"><LockOpen className="w-5 h-5 mr-2" /> Sign in to MindRay</span>
                   ) : (
                     <span className="flex items-center justify-center"><Smile className="w-5 h-5 mr-2" /> Start My Wellness Journey</span>
                   )
                 )}
               </Button>
            </form>

            <div className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
               {activeTab === 'signin' ? 'New to MindRay?' : 'Already have an account?'}
               <button 
                 onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                 className="text-blue-600 dark:text-blue-400 font-bold ml-2 hover:underline"
               >
                 {activeTab === 'signin' ? 'Create a free account' : 'Sign in'}
               </button>
            </div>



         </div>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
