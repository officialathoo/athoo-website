import { CheckCircle2 } from "lucide-react";

export default function TrustSafety() {
  const features = [
    { title: "Verified Providers", desc: "Every professional passes a strict background and skill check." },
    { title: "Secure Platform", desc: "Your data and bookings are protected with enterprise-grade security." },
    { title: "Real-Time Updates", desc: "Track your provider's arrival and job status right from the app." },
    { title: "Customer Support", desc: "Our dedicated team is ready to assist you anytime." },
    { title: "Transparent Pricing", desc: "No hidden fees. Know the cost estimate before you book." },
    { title: "Built for Pakistan", desc: "Tailored to local needs, language, and service standards." },
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Trust & Safety First</h2>
          <p className="text-lg md:text-xl text-primary-foreground/80">
            We don't compromise on your security. Athoo is built to give you peace of mind from booking to completion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-primary-foreground/80 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}