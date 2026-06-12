import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({ weight: "400", subsets: ['latin'] });

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-center items-center text-center px-4 py-16">
      <h1 className={`${pacifico.className} text-[clamp(2.2rem,4vw,3.5rem)] leading-none text-[#5335a8] m-0`}>
        hey!
      </h1>
      <p className="mt-3 mb-6 text-[#5d4f87] text-[clamp(0.9rem,1.5vw,1.1rem)] font-bold">
        What are you doing here?!
      </p>

      <Image 
        src="/assets/images/404/crying.png" 
        alt="404 crying illustration" 
        width={500}
        height={500}
        style={{ width: "100%", maxWidth: "500px", height: "auto" }}
        className="mb-8"
        priority
      />

      <Link 
        href="/"
        className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#545454] rounded-full text-[#2f2f2f] font-bold bg-[#f7f7f7] hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] transition-all duration-200"
      >
        <Home className="w-5 h-5" />
        Go Home
      </Link>
    </div>
  );
}
