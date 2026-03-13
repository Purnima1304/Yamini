"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Loader2, CheckCircle2, Video } from "lucide-react";
import Link from "next/link";
import { mockPsychiatrists } from '@/app/psychiatrist/page';

function AppointmentForm() {
  const searchParams = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctor');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    doctor: preselectedDoctorId || '',
    date: '',
    time: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch logged-in user data
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFormData(prev => ({
            ...prev,
            name: data.user.name || '',
            email: data.user.email || ''
          }));
        }
      })
      .catch(console.error);
  }, []);

  const activeDoctor = mockPsychiatrists.find(d => d.id === formData.doctor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.doctor || !formData.date || !formData.time) {
      setError("Please fill all the required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...formData,
           dateTime: `${formData.date}T${formData.time}`
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-xl mx-auto text-center py-12 px-6 border-emerald-200 bg-emerald-50/50 shadow-emerald-500/10 animate-in zoom-in-95 duration-500">
         <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
         <h2 className="text-3xl font-bold text-slate-900 mb-2">Appointment Confirmed!</h2>
         <p className="text-slate-600 mb-8 max-w-sm mx-auto">
           Your teletherapy session with <strong>{activeDoctor?.name}</strong> has been successfully booked for {new Date(formData.date).toLocaleDateString()} at {formData.time}. You will receive an email shortly with the secure video link. 
         </p>
         <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full sm:w-auto bg-slate-900 text-white shadow-md hover:bg-slate-800">
           Return to Dashboard
         </Link>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl shadow-blue-500/5 bg-white/80 border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-3xl pb-8">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
           <Video className="w-6 h-6 text-blue-500" /> Schedule Teletherapy
        </CardTitle>
        <CardDescription>Book a secure, private video consultation with our specialists.</CardDescription>
      </CardHeader>

      <CardContent className="pt-8">
        {error && (
           <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <Input 
                 placeholder="Jane Doe" 
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <Input 
                 type="email" 
                 placeholder="jane@example.com" 
                 value={formData.email}
                 onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Select Specialist</label>
              <div className="relative">
                <select 
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 appearance-none"
                  value={formData.doctor}
                  onChange={e => setFormData({...formData, doctor: e.target.value})}
                >
                  <option value="" disabled>Choose a professional...</option>
                  {mockPsychiatrists.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500"/> Select Date</label>
              <Input 
                 type="date" 
                 className="h-12"
                 value={formData.date}
                 onChange={e => setFormData({...formData, date: e.target.value})}
                 min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select Time</label>
              <Input 
                 type="time" 
                 className="h-12"
                 value={formData.time}
                 onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
             <Link href="/psychiatrist" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-slate-900 h-12 px-6">
                Cancel
             </Link>
             <Button type="submit" disabled={loading} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-base">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Confirm Booking'}
             </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function BookAppointmentPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>}>
        <AppointmentForm />
      </Suspense>
    </div>
  );
}
