import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";

export default async function CurrentRitual() {
  return (
    <section className="w-full py-16 px-6 bg-orange-50/50">
      <div className="container max-w-7xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-orange-900/5 flex flex-col md:flex-row items-stretch border border-orange-100">
          <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto min-h-[300px]">
             <div className="absolute inset-0 bg-orange-900" />
             <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white/50" />
             </div>
             <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-200 flex items-center gap-2 shadow-lg">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
               <span className="text-orange-900 text-sm font-bold">Live from Puri</span>
             </div>
          </div>

          <div className="p-10 md:p-16 flex flex-col justify-center w-full md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold w-max mb-6">
              <Clock className="w-4 h-4" />
              Mandir Darshan Open
            </div>
            <h3 className="text-3xl font-bold text-zinc-900 mb-2">Current Ritual</h3>
            <h4 className="text-2xl font-serif italic text-orange-600 mb-4">Sakala Dhupa</h4>
            <p className="text-zinc-600 mb-8 text-lg">
              The morning food offering to Lord Jagannath. This is one of the most significant daily rituals performed with immense devotion.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/daily-rituals" className="px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20">
                View Schedule
              </Link>
              <span className="text-orange-600 font-semibold">Next: Bhoga Mandap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
