import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import HomeContact from "@/components/home/HomeContact";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Athoo — Launch Updates & Support</title>
        <meta name="description" content="Contact Athoo for launch updates, provider waitlist support and general inquiries." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen bg-white">
        
        {/* Map Decorative Element Header */}
        <section className="relative h-64 w-full bg-gray-100 overflow-hidden">
           <div className="absolute inset-0 bg-[#081120]/80 z-10" />
           {/* Abstract map pattern via CSS */}
           <div 
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
           />
           <div className="absolute inset-0 z-20 flex items-center justify-center">
             <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-white"
             >
               We're Here to Help
             </motion.h1>
           </div>
        </section>

        {/* Reuse HomeContact but without the section wrapper padding since it has its own */}
        <HomeContact />

      </div>
    </>
  );
}