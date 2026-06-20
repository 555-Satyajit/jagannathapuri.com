import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Jagannathapuri",
  description: "Get in touch with the Jagannathapuri team for inquiries, feedback, and spiritual guidance.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] pt-24 pb-20">
      <div className="container max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-zinc-600">
            Have questions about our spiritual resources, products, or temple rituals? We are here to help. Send us a message and our team will respond shortly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 bg-white rounded-3xl overflow-hidden shadow-xl shadow-orange-900/5">
          
          {/* Left Column: Contact Details */}
          <div className="w-full lg:w-1/3 bg-orange-600 text-white p-8 md:p-12 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500 rounded-full opacity-50 blur-3xl"></div>
            
            <h2 className="text-2xl font-serif font-bold mb-8 relative z-10">Contact Information</h2>
            
            <div className="space-y-8 flex-1 relative z-10">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Our Location</h3>
                  <p className="text-orange-100 leading-relaxed">
                    Near Jagannath Temple,<br />
                    Grand Road, Puri<br />
                    Odisha, India - 752001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Phone Number</h3>
                  <p className="text-orange-100">
                    <a href="tel:+918895822941" className="hover:text-white transition-colors">+91 88958 22941</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Email Address</h3>
                  <p className="text-orange-100">
                    <a href="mailto:contact@jaysubhdra.com" className="hover:text-white transition-colors">contact@jaysubhdra.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Working Hours</h3>
                  <p className="text-orange-100">
                    Mon - Sun: 7:00 AM - 9:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="w-full lg:w-2/3 p-8 md:p-12 lg:pl-0">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-6">Send us a Message</h2>
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  );
}
