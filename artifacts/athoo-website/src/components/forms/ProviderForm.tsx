import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitToAthooEmail } from "@/lib/emailSubmit";

const providerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  service: z.string().min(1, "Please select your service"),
  city: z.string().min(1, "Please select your city"),
  experience: z.string().min(1, "Please state your experience"),
  message: z.string().optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

export function ProviderForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { name: "", phone: "", email: "", service: "", city: "", experience: "", message: "" },
  });

  const onSubmit = async (data: ProviderFormValues) => {
    setIsSubmitting(true);
    try {
      await submitToAthooEmail("Provider Waitlist", {
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        service: data.service,
        city: data.city,
        experience: data.experience,
        message: data.message || "",
      });
      setIsSuccess(true);
    } catch {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please WhatsApp us at +92 339 0051068 or email official@athoo.pk.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/5 p-8 text-center"
        data-testid="provider-success"
      >
        <CheckCircle2 className="mb-6 h-16 w-16 text-green-500" />
        <h3 className="mb-3 text-2xl font-black text-foreground">Application Submitted!</h3>
        <p className="text-lg text-muted-foreground">
          Thank you for your interest in joining Athoo. Our team will review your application and contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm md:p-8"
        data-testid="form-provider"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input className="min-h-12" placeholder="Ali Khan" {...field} data-testid="input-provider-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input className="min-h-12" placeholder="0300 1234567" {...field} data-testid="input-provider-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input className="min-h-12" placeholder="ali@example.com" type="email" {...field} data-testid="input-provider-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-12" data-testid="select-provider-city">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                    <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Service *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-12" data-testid="select-provider-service">
                      <SelectValue placeholder="What do you do?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Electrician">Electrician</SelectItem>
                    <SelectItem value="Plumber">Plumber</SelectItem>
                    <SelectItem value="AC Technician">AC Technician</SelectItem>
                    <SelectItem value="Carpenter">Carpenter</SelectItem>
                    <SelectItem value="Painter">Painter</SelectItem>
                    <SelectItem value="Home Cleaner">Home Cleaner</SelectItem>
                    <SelectItem value="Appliance Repair">Appliance Repair</SelectItem>
                    <SelectItem value="Mason">Mason</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-12" data-testid="select-provider-experience">
                      <SelectValue placeholder="Experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-3 years">1–3 years</SelectItem>
                    <SelectItem value="3-5 years">3–5 years</SelectItem>
                    <SelectItem value="5-10 years">5–10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about any certifications or large projects you have worked on."
                  className="min-h-[100px]"
                  {...field}
                  data-testid="textarea-provider-message"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-14 w-full text-lg font-black"
          disabled={isSubmitting}
          data-testid="button-provider-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting Application…
            </>
          ) : (
            "Apply to Become a Provider"
          )}
        </Button>
      </form>
    </Form>
  );
}
