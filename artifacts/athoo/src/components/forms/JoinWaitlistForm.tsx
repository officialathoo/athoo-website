import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { submitToAthooEmail } from "@/lib/emailSubmit";

const formSchema = z.object({ email: z.string().email("Please enter a valid email").max(255) });
type FormValues = z.infer<typeof formSchema>;

export default function JoinWaitlistForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { email: "" } });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await submitToAthooEmail("Waitlist Signup", values);
      toast({ title: "Waitlist Joined", description: "Thank you. Your email has been received by Athoo." });
      form.reset();
    } catch {
      toast({ variant: "destructive", title: "Waitlist Status", description: "Could not submit online. Please email official.athoo@gmail.com or WhatsApp +92 339 0051068." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormControl><Input placeholder="Enter your email address" type="email" className="min-h-12 bg-background" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <Button type="submit" size="lg" className="min-h-12 w-full px-8 sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>Join Waitlist <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      </Form>
    </div>
  );
}
