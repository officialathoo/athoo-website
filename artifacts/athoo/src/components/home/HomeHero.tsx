import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wrench, Sparkles, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";
import JoinWaitlistForm from "@/components/forms/JoinWaitlistForm";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] w-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-3xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                <Sparkles className="mr-2 h-4 w-4" />
                Launching Soon in Pakistan
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                Pakistan's Smart <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                  Home Services
                </span> Platform
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Find trusted professionals for everyday services — fast, reliable, and built for Pakistan.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold shadow-lg" asChild>
                <a href="#waitlist">Follow Launch Updates</a>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-semibold" asChild>
                <Link href="/become-provider">Become a Provider</Link>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Verified Pros
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                App Coming Soon
              </div>
            </motion.div>
          </div>

          {/* Visual / Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative w-full max-w-lg lg:max-w-none hidden md:block"
          >
            <div className="relative mx-auto w-[280px] h-[580px] rounded-[3rem] border-[8px] border-foreground/10 bg-background shadow-2xl overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-foreground/10 rounded-b-3xl" />
               <div className="w-full h-full bg-muted/30 p-6 flex flex-col pt-12 relative">
                 <div className="space-y-4">
                   <div className="h-10 w-3/4 bg-primary/20 rounded-lg animate-pulse" />
                   <div className="grid grid-cols-2 gap-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="aspect-square bg-background rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                         <div className="h-8 w-8 rounded-full bg-primary/10" />
                         <div className="h-2 w-16 bg-muted rounded" />
                       </div>
                     ))}
                   </div>
                   <div className="mt-8 h-32 w-full bg-background rounded-xl shadow-sm p-4 space-y-3">
                      <div className="h-4 w-1/2 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted/50 rounded" />
                      <div className="h-3 w-3/4 bg-muted/50 rounded" />
                   </div>
                 </div>
                 
                 {/* Floating badges */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                   className="absolute -right-12 top-32 bg-background shadow-xl rounded-lg p-3 flex items-center gap-3 border border-primary/10"
                 >
                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                     <Wrench className="h-5 w-5" />
                   </div>
                   <div>
                     <div className="text-sm font-bold">Electrician</div>
                     <div className="text-xs text-muted-foreground">Arriving in 15m</div>
                   </div>
                 </motion.div>
                 
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}