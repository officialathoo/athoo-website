import { Helmet } from "react-helmet-async";
import ProviderInterestForm from "@/components/forms/ProviderInterestForm";
import { CheckCircle2 } from "lucide-react";

export default function BecomeProvider() {
  return (
    <>
      <Helmet>
        <title>Earn With Athoo | Become a Provider</title>
        <meta name="description" content="Join Athoo as a service provider and grow your home services business in Pakistan. Flexible hours, verified customers, and great earnings." />
      </Helmet>
      
      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Earn With Athoo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Are you a skilled electrician, plumber, or handyman? Join Pakistan's fastest-growing network of trusted professionals and boost your income.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Benefits */}
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold mb-6">Why Partner with Us?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Consistent Income</h3>
                      <p className="text-muted-foreground">Get a steady stream of job requests in your local area without spending money on marketing.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Flexible Schedule</h3>
                      <p className="text-muted-foreground">Work when you want. You are your own boss—accept jobs that fit your availability.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Zero Registration Fees</h3>
                      <p className="text-muted-foreground">Signing up is completely free. We only make money when you make money.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Easy Payouts</h3>
                      <p className="text-muted-foreground">Receive your earnings directly into your bank or mobile wallet without long delays.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                <h3 className="font-bold text-orange-600 mb-2">How it works:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Submit your application below</li>
                  <li>Our team verifies your identity and skills</li>
                  <li>Download the Athoo Provider App</li>
                  <li>Start accepting jobs and earning!</li>
                </ol>
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Apply Now</h3>
              <ProviderInterestForm />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}