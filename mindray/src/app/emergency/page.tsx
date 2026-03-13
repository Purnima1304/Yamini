import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, HeartPulse, ShieldAlert, MapPin, ExternalLink, Contact } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function EmergencyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let emergencyContact = null;
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        if (payload && payload.emergencyContact) {
           emergencyContact = payload.emergencyContact;
        }
      }
    } catch(e) {}
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
           <HeartPulse className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">You are not alone.</h1>
        <p className="text-slate-500 mt-2 text-lg">If you are in immediate danger or experiencing a mental health crisis, please reach out for professional support immediately.</p>
      </header>

      {emergencyContact && (
        <Card className="border-blue-200 shadow-blue-500/10 bg-gradient-to-br from-blue-50 to-white mb-6">
          <CardContent className="p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
             <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 shrink-0">
               <Contact className="w-12 h-12 text-white" />
             </div>
             <div className="flex-1">
               <h2 className="text-2xl font-bold text-slate-900 mb-2">My Trusted Contact</h2>
               <p className="text-slate-600 mb-6 font-medium text-lg">{emergencyContact}</p>
               <a href={`tel:${emergencyContact}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-14 px-8 text-xl shadow-lg shadow-blue-500/20">
                 <Phone className="w-5 h-5 mr-3" /> Call Contact
               </a>
             </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-rose-200 shadow-rose-500/10 bg-gradient-to-br from-rose-50 to-white">
        <CardContent className="p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
           <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40 shrink-0">
             <Phone className="w-10 h-10 text-white animate-pulse" />
           </div>
           <div className="flex-1">
             <h2 className="text-2xl font-bold text-slate-900 mb-2">National Suicide & Crisis Lifeline</h2>
             <p className="text-slate-600 mb-6">Free, confidential support available 24/7 for people in distress, prevention and crisis resources.</p>
             <div className="flex flex-col sm:flex-row gap-4">
               <a href="tel:988" className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white w-full sm:w-auto bg-rose-600 hover:bg-rose-700 h-14 px-8 text-xl shadow-lg shadow-rose-500/20">
                 Call 988
               </a>
               <a href="sms:988" className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white hover:bg-slate-100 border w-full sm:w-auto h-14 px-8 text-lg border-rose-200 text-rose-700 hover:bg-rose-100">
                 Text 988
               </a>
             </div>
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="text-blue-500 w-5 h-5" /> Emergency Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div>
                 <h4 className="font-bold text-slate-800">Local Emergency (US/CA)</h4>
                 <p className="text-sm text-slate-500">For immediate, life-threatening danger.</p>
               </div>
               <a href="tel:911" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-white bg-slate-900 shadow-md hover:bg-slate-800">
                 <Phone className="w-4 h-4 mr-2" /> 911
               </a>
             </div>
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div>
                 <h4 className="font-bold text-slate-800">International EU</h4>
                 <p className="text-sm text-slate-500">Universal European emergency number.</p>
               </div>
               <a href="tel:112" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900">
                 <Phone className="w-4 h-4 mr-2" /> 112
               </a>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-teal-500 w-5 h-5" /> Nearby Support
            </CardTitle>
            <CardDescription>Find psychiatrists and therapists in your area.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-600 mb-6">We have a curated network of verified mental health professionals ready to assist you on your journey to wellness.</p>
             <Link href="/psychiatrist">
                <Button className="w-full text-base h-12 bg-teal-600 hover:bg-teal-700">
                  <ExternalLink className="w-4 h-4 mr-2" /> Browse Directory
                </Button>
             </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
