import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const faqs = [
    {
      q: "What is Athoo?",
      a: "Athoo is an upcoming Pakistani home services app designed to connect customers with verified local service providers after launch.",
    },
    {
      q: "When is Athoo launching?",
      a: "Athoo is currently in pre-launch. Sign up for early access to be notified the moment we launch.",
    },
    {
      q: "Which cities will Athoo cover?",
      a: "Athoo is preparing launch coverage in Pakistan and will announce supported cities before launch.",
    },
    {
      q: "How do I become a provider?",
      a: "Join the provider waitlist. Our team will contact interested professionals when provider onboarding opens.",
    },
    {
      q: "Is Athoo free to use?",
      a: "Athoo is not launched yet. App availability and service details will be announced at launch.",
    },
    {
      q: "How are providers verified?",
      a: "Athoo plans a provider verification process including identity, documents, and skill checks before providers can join the platform.",
    },
    {
      q: "What services does Athoo offer?",
      a: "Athoo is preparing 10+ service categories including electrician, plumber, AC service, carpenter, painter, cleaning, appliance repair, mason, welder and more.",
    },
    {
      q: "How do I contact Athoo?",
      a: "You can email us at official.athoo@gmail.com or call/WhatsApp us at +92 339 0051068.",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto max-w-3xl px-6">
        <h2 className="mb-12 text-center text-4xl font-extrabold text-gray-900">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 px-4">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline hover:text-blue-600">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}