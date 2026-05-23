import JoinWaitlistForm from "@/components/forms/JoinWaitlistForm";

export default function WaitlistSection() {
  return (
    <section id="waitlist" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-muted/50 rounded-3xl p-8 md:p-16 text-center border shadow-sm">
          <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium text-foreground mb-6 shadow-sm">
            Coming Soon to App Store & Google Play
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Be the first to know when we launch</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Athoo is launching soon. Join our waitlist to get early access, exclusive discounts, and launch updates directly to your inbox.
          </p>
          
          <div className="flex justify-center mb-10">
            <JoinWaitlistForm />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
             {/* Fake App Store Badges */}
             <div className="h-12 w-36 bg-foreground rounded-lg flex items-center justify-center text-background opacity-50 grayscale select-none">
               <span className="text-xs font-semibold">App Store</span>
             </div>
             <div className="h-12 w-36 bg-foreground rounded-lg flex items-center justify-center text-background opacity-50 grayscale select-none">
               <span className="text-xs font-semibold">Google Play</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}