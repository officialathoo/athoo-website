import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase } from "lucide-react";
import { submitToAthooEmail } from "@/lib/emailSubmit";

const SERVICES = ["Electrician", "Plumber", "AC Technician", "Carpenter", "Painter", "Cleaner", "Appliance Repair", "Mason", "Welder", "Home Maintenance", "Other"];
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Multan", "Other"];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Valid phone number required").max(20),
  email: z.string().email("Please enter a valid email").max(255).optional().or(z.literal("")),
  service: z.string().min(1, "Please select a service").max(100),
  city: z.string().min(1, "Please select your city").max(100),
  experience: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProviderInterestForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { name: "", phone: "", email: "", service: "", city: "", experience: "" } });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await submitToAthooEmail("Provider Waitlist", values);
      toast({ title: "Provider Waitlist Joined", description: "Thank you. Your provider request has been sent to Athoo team." });
      form.reset();
    } catch {
      toast({ variant: "destructive", title: "Request Not Sent", description: "Please email official.athoo@gmail.com or WhatsApp +92 339 0051068." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input className="min-h-12" placeholder="Ahmad Raza" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input className="min-h-12" placeholder="0300 1234567" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address (Optional)</FormLabel><FormControl><Input className="min-h-12" placeholder="ahmad@example.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="service" render={({ field }) => (<FormItem><FormLabel>Service Type *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="min-h-12"><SelectValue placeholder="Select your expertise" /></SelectTrigger></FormControl><SelectContent>{SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="min-h-12"><SelectValue placeholder="Select your city" /></SelectTrigger></FormControl><SelectContent>{CITIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="experience" render={({ field }) => (<FormItem><FormLabel>Experience (Optional)</FormLabel><FormControl><Textarea placeholder="Tell us about your past work and experience..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" className="min-h-12 w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Briefcase className="mr-2 h-5 w-5" />} Join Provider Waitlist
        </Button>
      </form>
    </Form>
  );
}
