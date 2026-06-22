import { Helmet } from "react-helmet-async";
import { motion } from "@/lib/motionLite";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, CheckCircle, Handshake, Star, UserPlus, FileCheck, Bell, MapPin, TrendingUp } from "lucide-react";

const customerSteps = [
  {
    icon: Search,
    title: "1. Choose a Service",
    desc: "Select the service you need from our comprehensive list of home maintenance categories."
  },
  {
    icon: FileText,
    title: "2. Share Job Details",
    desc: "Describe your problem, attach photos if needed, and pick a convenient time for the visit."
  },
  {
    icon: Handshake,
    title: "3. Get Matched",
    desc: "We instantly match you with a verified, highly-rated professional nearby."
  },
  {
    icon: CheckCircle,
    title: "4. Confirm Booking",
    desc: "Review the estimated transparent pricing and confirm your booking securely."
  },
  {
    icon: Star,
    title: "5. Service Completed",
    desc: "The professional gets the job done. Rate your experience to help maintain our quality standards."
  }
];

const providerSteps = [
  {
    icon: UserPlus,
    title: "1. Register",
    desc: "Sign up on the Athoo Partner app with your basic details and service expertise."
  },
  {
    icon: FileCheck,
    title: "2. Submit Verification",
    desc: "Provide your CNIC, references, and undergo our standard background check process."
  },
  {
    icon: Bell,
    title: "3. Receive Requests",
    desc: "Get notified instantly when customers in your area request your specific services."
  },
  {
    icon: MapPin,
    title: "4. Accept Job",
    desc: "Review the job details, accept the request, and navigate to the customer's location."
  },
  {
    icon: TrendingUp,
    title: "5. Complete & Grow",
    desc: "Finish the work, get paid, earn good reviews, and grow your local business."
  }
];

export default function HowItWorksPage() {
  return (
    <>
      <Helmet>
        <title>How Athoo Works — Platform Overview | Athoo</title>
        <meta name="description" content="Learn how Athoo works for customers and service providers in Rawalpindi and Islamabad. Browse services, get matched with verified professionals, and confirm bookings easily." />
        <link rel="canonical" href="https://www.athoo.pk/how-it-works" />
        <meta property="og:title" content="How Athoo Works — Platform Overview" />
        <meta property="og:description" content="Learn how Athoo works for customers and service providers in Pakistan." />
        <meta property="og:url" content="https://www.athoo.pk/how-it-works" />
        <meta property="og:image" content="https://www.athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How Athoo Works — Platform Overview" />
        <meta name="twitter:description" content="Learn how Athoo works for customers and service providers in Pakistan." />
        <meta name="twitter:image" content="https://www.athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "How It Works", "item": "https://www.athoo.pk/how-it-works" }
          ]
        })}</script>
      </Helmet>
      <div className="pt-12 pb-24">
      <div className="bg-primary/5 py-16 mb-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            How Athoo Works
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            A seamless experience designed to connect you with the right people, instantly.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Tabs defaultValue="customers" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-gray-100/80 rounded-xl h-14">
              <TabsTrigger value="customers" className="text-base rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">For Customers</TabsTrigger>
              <TabsTrigger value="providers" className="text-base rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">For Service Partners</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="customers" className="mt-0 outline-none">
            <div className="space-y-12">
              {customerSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 md:gap-8 relative"
                >
                  {/* Timeline line */}
                  {index !== customerSteps.length - 1 && (
                    <div className="absolute left-8 md:left-10 top-20 bottom-[-3rem] w-px bg-gray-200" />
                  )}
                  
                  <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-2 border-primary/20 flex items-center justify-center text-primary shadow-sm relative z-10">
                    <step.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  
                  <div className="pt-2 pb-6">
                    <h3 className="text-2xl font-bold font-serif text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
            >
              <Button size="lg" asChild className="px-8 h-14 text-lg">
                <Link href="/#waitlist">Join the Customer Waitlist</Link>
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="providers" className="mt-0 outline-none">
            <div className="space-y-12">
              {providerSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 md:gap-8 relative"
                >
                  {/* Timeline line */}
                  {index !== providerSteps.length - 1 && (
                    <div className="absolute left-8 md:left-10 top-20 bottom-[-3rem] w-px bg-gray-200" />
                  )}
                  
                  <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-2 border-secondary/30 flex items-center justify-center text-secondary shadow-sm relative z-10">
                    <step.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  
                  <div className="pt-2 pb-6">
                    <h3 className="text-2xl font-bold font-serif text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
            >
              <Button size="lg" variant="secondary" asChild className="px-8 h-14 text-lg text-white">
                <Link href="/#partner">Apply as a Service Partner</Link>
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
