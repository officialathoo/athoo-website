import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const faqs = [
    { q: "What is Athoo?", a: "Athoo is a Pakistani home services platform currently in pre-launch. The goal is to connect customers with verified service providers for common home and repair services through a mobile app and website-based early access system." },
    { q: "Is the Athoo app live right now?", a: "The app is not live yet. Athoo is currently collecting customer waitlist requests, provider interest forms and launch inquiries. App Store and Google Play availability will be announced when the platform is ready." },
    { q: "Which cities will Athoo cover first?", a: "The initial operational focus is Rawalpindi and Islamabad. After testing, verification and provider onboarding are stable, Athoo can expand city by city." },
    { q: "How will customers book a service after launch?", a: "After launch, customers will choose a service category, share job details, location and contact information, then receive service support through the Athoo app flow. Final booking, provider assignment, pricing and tracking will depend on the launched app version." },
    { q: "How can I become an Athoo provider?", a: "Skilled professionals can join the provider waitlist from the website. Athoo may contact shortlisted providers for identity details, document verification, service category selection and onboarding steps before activation." },
    { q: "What documents may providers need?", a: "Provider onboarding may require CNIC, profile information, service experience, skill proof where applicable, police verification where required, and any service-specific documents. Final requirements will be confirmed during onboarding." },
    { q: "How does Athoo verify providers?", a: "Athoo plans to review identity, documents, contact information, service category, experience and other safety checks before allowing providers to receive customer requests." },
    { q: "Will customers get invoices or payment records?", a: "Athoo is planned to support proper service records and invoice-style summaries after launch. Final payment and invoice flow will be confirmed once the live app is released." },
    { q: "Is Athoo safe to use?", a: "Safety is a core part of the planned platform. Athoo is being prepared with provider verification, controlled onboarding, customer support channels and service history tracking." },
    { q: "How do I contact Athoo?", a: "You can email official.athoo@gmail.com or WhatsApp/call +92 339 0051068. The same contact details are available in the footer and contact section of the website." },
    { q: "Can I partner with Athoo?", a: "Yes. Businesses, service professionals and local teams can contact Athoo through the website contact form or by emailing official.athoo@gmail.com." },
    { q: "Why should I join the waitlist?", a: "Joining the waitlist helps Athoo understand demand, contact early users first and share launch updates when service access becomes available in your city." },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container mx-auto max-w-4xl px-5 sm:px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-[#FF8A00]">Help Center</div>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">Clear answers for customers, providers and early users before the official Athoo app launch.</p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 shadow-sm transition hover:shadow-md sm:px-6">
              <AccordionTrigger className="text-left text-base font-bold text-gray-900 hover:no-underline hover:text-blue-600 sm:text-lg">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-gray-600 sm:text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
