import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Search, CheckCircle2, UserPlus, FileCheck, DollarSign } from "lucide-react";

export default function HowItWorks() {
  const customerSteps = [
    {
      title: "Open the App",
      description: "Download Athoo and browse our wide range of home services.",
      icon: Smartphone,
    },
    {
      title: "Select Service",
      description: "Choose what you need done and pick a convenient time.",
      icon: Search,
    },
    {
      title: "Get Connected",
      description: "A verified professional arrives to get the job done right.",
      icon: CheckCircle2,
    },
  ];

  const providerSteps = [
    {
      title: "Register",
      description: "Sign up as a service provider on our platform.",
      icon: UserPlus,
    },
    {
      title: "Get Verified",
      description: "Complete our quick background and skill verification process.",
      icon: FileCheck,
    },
    {
      title: "Receive Jobs",
      description: "Start getting job requests in your area and earn money.",
      icon: DollarSign,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Athoo Works</h2>
          <p className="text-lg text-muted-foreground">
            A seamless experience whether you need a service or want to provide one.
          </p>
        </div>

        <Tabs defaultValue="customers" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 h-14 mb-12">
            <TabsTrigger value="customers" className="text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow">
              For Customers
            </TabsTrigger>
            <TabsTrigger value="providers" className="text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow">
              For Providers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {customerSteps.map((step, i) => (
                <Card key={i} className="bg-background border-none shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-9xl font-bold text-muted/20 -z-10 leading-none pointer-events-none select-none">
                    {i + 1}
                  </div>
                  <CardContent className="pt-8 pb-8 px-6 text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="providers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {providerSteps.map((step, i) => (
                <Card key={i} className="bg-background border-none shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-9xl font-bold text-muted/20 -z-10 leading-none pointer-events-none select-none">
                    {i + 1}
                  </div>
                  <CardContent className="pt-8 pb-8 px-6 text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}