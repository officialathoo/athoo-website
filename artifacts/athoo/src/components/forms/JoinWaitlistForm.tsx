import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useJoinWaitlist, useGetWaitlistCount } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetWaitlistCountQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
});

type FormValues = z.infer<typeof formSchema>;

export default function JoinWaitlistForm() {
  const { toast } = useToast();
  const joinWaitlist = useJoinWaitlist();
  const queryClient = useQueryClient();
  const { data: waitlistData } = useGetWaitlistCount();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: FormValues) {
    joinWaitlist.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "You're on the list!",
            description: "Thanks for joining. We'll notify you when we launch.",
          });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getGetWaitlistCountQueryKey() });
        },
        onError: (error) => {
          let desc = "Failed to join waitlist. Please try again.";
          if (error.error === "Already registered" || error.error?.includes("already")) {
             desc = "You are already on the list!";
          } else if (error.error?.includes("Too many")) {
             desc = "Too many requests, try again later";
          }
          toast({
            variant: "destructive",
            title: "Waitlist Status",
            description: desc,
          });
        },
      }
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
               <FormItem className="flex-1">
                 <FormControl>
                   <Input placeholder="Enter your email address" type="email" className="h-12 bg-background" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8" disabled={joinWaitlist.isPending}>
            {joinWaitlist.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>Join Waitlist <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>
      </Form>
      
      {waitlistData && waitlistData.count > 0 && (
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Join <span className="font-semibold text-foreground">{waitlistData.count}</span> others waiting for Athoo.
        </p>
      )}
    </div>
  );
}