import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: FormValues) {
    submitContact.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Request Received",
            description: "Thank you. Your request has been received. Athoo team will contact you soon.",
          });
          form.reset();
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.error || "Failed to send message. Please try again.",
          });
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Full Name *</FormLabel>
                 <FormControl>
                   <Input placeholder="Ali Khan" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Email Address *</FormLabel>
                 <FormControl>
                   <Input placeholder="ali@example.com" type="email" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Phone Number</FormLabel>
                 <FormControl>
                   <Input placeholder="0300 1234567" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Subject</FormLabel>
                 <FormControl>
                   <Input placeholder="How can we help?" {...field} />
                 </FormControl>
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
               <FormLabel>Message *</FormLabel>
               <FormControl>
                 <Textarea placeholder="Tell us more about your inquiry..." className="min-h-[120px]" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={submitContact.isPending}>
          {submitContact.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Message
        </Button>
      </form>
    </Form>
  );
}