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
      a: "Athoo is Pakistan's first trusted home services marketplace that connects you with verified professionals for your everyday needs.",
    },
    {
      q: "When is Athoo launching?",
      a: "Athoo is currently in pre-launch. Sign up for early access to be notified the moment we go live in 2025.",
    },
    {
      q: "Which cities will Athoo cover?",
      a: "We are starting with Karachi, Lahore, and Islamabad, with plans to expand to more cities rapidly.",
    },
    {
      q: "How do I become a provider?",
      a: "Register your interest through our 'Become a Provider' page, complete the verification process, and you can start receiving jobs.",
    },
    {
      q: "Is Athoo free to use?",
      a: "Downloading and using the Athoo app is completely free for customers. You only pay for the services you book.",
    },
    {
      q: "How are providers verified?",
      a: "All providers go through background checks, skill tests, and document verification to ensure they meet our strict quality and safety standards.",
    },
    {
      q: "What services does Athoo offer?",
      a: "We offer services including Electrician, Plumber, AC Service, Carpenter, Painter, Cleaning, Appliance Repair, and general Home Maintenance.",
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