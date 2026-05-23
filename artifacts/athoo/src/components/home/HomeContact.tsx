import ContactForm from "@/components/forms/ContactForm";
import { Mail, Phone } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";

export default function HomeContact() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Let's talk.</h2>
              <p className="text-lg text-muted-foreground">
                Have questions about our launch, services, or partnering with us? We'd love to hear from you.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Email us</div>
                  <a href="mailto:official.athoo@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                    official.athoo@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Call or WhatsApp</div>
                  <a href="tel:+923390051068" className="text-muted-foreground hover:text-primary transition-colors">
                    +92 339 0051068
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="font-semibold mb-4">Follow Athoo</div>
              <div className="flex gap-4">
                <a href="https://instagram.com/athoo_services" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-sm">
                  <SiInstagram className="h-4 w-4" />
                </a>
                <a href="https://facebook.com/athoo_services" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-sm">
                  <SiFacebook className="h-4 w-4" />
                </a>
                <a href="https://tiktok.com/athoo.pk" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-sm">
                  <SiTiktok className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-background border rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            <ContactForm />
          </div>

        </div>
      </div>
    </section>
  );
}