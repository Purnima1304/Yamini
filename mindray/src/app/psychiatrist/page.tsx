import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Star, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import Link from 'next/link';

export const mockPsychiatrists = [
  {
    id: "dr-ananya-patel",
    name: "Dr. Ananya Patel",
    specialty: "Cognitive Behavioral Therapy (CBT)",
    experience: "12 Years",
    rating: 4.9,
    reviews: 124,
    location: "Downtown Clinic & Telehealth",
    availability: "Available Tomorrow",
    image: "A"
  },
  {
    id: "dr-michael-chen",
    name: "Dr. Michael Chen",
    specialty: "Child & Adolescent Psychiatry",
    experience: "8 Years",
    rating: 4.8,
    reviews: 89,
    location: "Westside Medical Center",
    availability: "Next Week",
    image: "M"
  },
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    specialty: "Trauma & PTSD Specialist",
    experience: "15 Years",
    rating: 5.0,
    reviews: 211,
    location: "Telehealth Only",
    availability: "Available Today",
    image: "S"
  },
  {
    id: "dr-robert-davis",
    name: "Dr. Robert Davis",
    specialty: "Addiction Psychiatry",
    experience: "20 Years",
    rating: 4.7,
    reviews: 302,
    location: "City Hospital",
    availability: "Available Friday",
    image: "R"
  }
];

export default function PsychiatristsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <GraduationCap className="text-indigo-500" /> Specialist Directory
          </h1>
          <p className="text-slate-500 mt-2">Find and connect with verified mental health professionals.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {mockPsychiatrists.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200">
            <CardContent className="p-0">
               <div className="flex flex-col sm:flex-row">
                 <div className="p-6 bg-slate-50 flex flex-col items-center justify-center sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-100">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-700 shadow-inner mb-4">
                      {doctor.image}
                    </div>
                    <div className="flex items-center text-amber-500 font-bold">
                       <Star className="w-4 h-4 fill-current mr-1 text-amber-500" />
                       {doctor.rating}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{doctor.reviews} Reviews</p>
                 </div>
                 <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-indigo-600 font-medium text-sm mb-4">{doctor.specialty}</p>
                      
                      <div className="space-y-2 mb-6">
                        <p className="text-sm text-slate-600 flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-slate-400" /> Experience: {doctor.experience}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400" /> {doctor.location}
                        </p>
                        <p className="text-sm text-emerald-600 font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-emerald-500" /> {doctor.availability}
                        </p>
                      </div>
                    </div>

                    <Link href={`/book-appointment?doctor=${doctor.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full mt-auto bg-slate-900 text-white shadow-md hover:bg-slate-800">
                       Book Appointment
                    </Link>
                 </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
