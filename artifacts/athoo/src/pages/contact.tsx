import { Helmet } from "react-helmet-async";
import ContactForm from "@/components/forms/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Athoo</title>
        <meta name="description" content="Get in touch with the Athoo team. We're here to help." />
      </Helmet>
      
      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question about our services or want to partner with us? Our team is ready to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-muted/30 p-8 rounded-2xl border">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <a href="mailto:official.athoo@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                        official.athoo@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Phone / WhatsApp</h4>
                      <a href="tel:+923390051068" className="text-muted-foreground hover:text-primary transition-colors">
                        +92 339 0051068
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Location</h4>
                      <p className="text-muted-foreground">Pakistan</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t">
                  <h4 className="font-semibold mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    <a href="https://instagram.com/athoo_services" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all">
                      <SiInstagram className="h-5 w-5" />
                    </a>
                    <a href="https://facebook.com/athoo_services" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all">
                      <SiFacebook className="h-5 w-5" />
                    </a>
                    <a href="https://tiktok.com/athoo.pk" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all">
                      <SiTiktok className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-background p-8 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
              <ContactForm />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}