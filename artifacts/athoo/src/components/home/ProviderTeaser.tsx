import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Clock } from "lucide-react";

export default function ProviderTeaser() {
  return (
    <section className="py-20 bg-background border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-orange-500/5 rounded-3xl p-8 md:p-12 border border-orange-500/20">
          
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Earn more with Athoo</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Are you a skilled professional? Join Athoo's network to find more customers, manage your schedule, and grow your income on your own terms.
            </p>
            
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3 font-medium">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Access to a large customer base
              </li>
              <li className="flex items-center gap-3 font-medium">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
                Flexible working hours
              </li>
              <li className="flex items-center gap-3 font-medium">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                Easy onboarding and fast payouts
              </li>
            </ul>

            <div className="pt-6">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                <Link href="/become-provider">Apply to Become a Provider</Link>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full flex justify-center">
            {/* Visual element instead of generic image */}
            <div className="relative w-full max-w-sm aspect-square bg-white rounded-full shadow-2xl border-8 border-orange-50 p-8 flex flex-col items-center justify-center text-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-transparent rounded-full opacity-50 pointer-events-none" />
               <h3 className="text-5xl font-bold text-orange-600 mb-2">Rs.</h3>
               <p className="text-xl font-semibold">Grow Your Income</p>
               <p className="text-sm text-muted-foreground mt-2">Zero registration fees to join.</p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}