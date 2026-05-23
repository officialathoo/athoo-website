import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function AppShowcase() {
  return (
    <section id="app-showcase" className="py-24 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-8 max-w-2xl mx-auto lg:mx-0">
            <div>
              <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium text-foreground mb-6 shadow-sm">
                The Athoo App (Coming Soon)
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need, right in your pocket.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Booking a service has never been this easy. The Athoo app brings thousands of verified professionals directly to your smartphone.
              </p>
            </div>

            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Seamless Booking Flow</h3>
                  <p className="text-muted-foreground">Select your service, choose a time, and get a confirmed booking in under 60 seconds.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Real-Time Updates</h3>
                  <p className="text-muted-foreground">Track your professional's arrival on the map and communicate directly through the app.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Verified Provider Profiles</h3>
                  <p className="text-muted-foreground">View ratings, past reviews, and verified skill badges before your professional arrives.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 relative w-full flex justify-center lg:justify-end perspective-[1000px]">
            {/* Customer App Frame */}
            <motion.div 
              initial={{ rotateY: -15, x: 50, opacity: 0 }}
              whileInView={{ rotateY: -15, x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-20 w-[260px] h-[540px] rounded-[2.5rem] border-[6px] border-foreground/10 bg-background shadow-2xl overflow-hidden transform-gpu"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-foreground/10 rounded-b-2xl z-30" />
              <div className="w-full h-full bg-muted/20 p-4 pt-10 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                   <div className="h-8 w-24 bg-primary/20 rounded-md" />
                   <div className="h-8 w-8 bg-muted rounded-full" />
                </div>
                <div className="h-24 w-full bg-primary text-primary-foreground rounded-xl p-4 flex flex-col justify-end">
                   <div className="text-xs opacity-80">Next Booking</div>
                   <div className="font-bold">Electrician - Today, 4:00 PM</div>
                </div>
                <div className="font-bold text-sm">Popular Services</div>
                <div className="grid grid-cols-2 gap-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="aspect-[4/3] bg-background border rounded-lg p-2 flex flex-col items-center justify-center gap-1 shadow-sm">
                       <div className="h-6 w-6 rounded-full bg-primary/10" />
                       <div className="h-1.5 w-12 bg-muted rounded" />
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>

            {/* Provider App Frame */}
            <motion.div 
              initial={{ rotateY: 15, x: -50, opacity: 0 }}
              whileInView={{ rotateY: 15, x: -80, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="absolute top-10 right-0 lg:right-20 z-10 w-[240px] h-[500px] rounded-[2.5rem] border-[6px] border-foreground/5 bg-background shadow-xl overflow-hidden transform-gpu"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-20 bg-foreground/5 rounded-b-2xl z-30" />
              <div className="w-full h-full bg-orange-500/5 p-4 pt-10 flex flex-col gap-3">
                 <div className="text-center mb-2">
                   <div className="text-xs text-muted-foreground">Today's Earnings</div>
                   <div className="font-bold text-2xl text-orange-600">Rs. 4,500</div>
                 </div>
                 <div className="space-y-3 mt-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="bg-background border rounded-lg p-3 shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                         <div className="h-2 w-16 bg-muted rounded" />
                         <div className="h-4 w-12 bg-orange-100 rounded-full" />
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded-full bg-muted" />
                         <div className="h-2 w-20 bg-muted/50 rounded" />
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}