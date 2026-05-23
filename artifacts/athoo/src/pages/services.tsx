import { Helmet } from "react-helmet-async";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home } from "lucide-react";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Professional electrical wiring, repairs, and installations for residential and commercial properties.", icon: Zap },
  { id: "plumber", name: "Plumber", desc: "Expert plumbing services for leak repairs, pipe installations, and bathroom fittings.", icon: Droplets },
  { id: "ac", name: "AC Service", desc: "Comprehensive AC maintenance, gas filling, and repair to keep you cool during summer.", icon: Wind },
  { id: "carpenter", name: "Carpenter", desc: "Custom furniture making, repairs, and assembly by skilled woodworkers.", icon: Hammer },
  { id: "painter", name: "Painter", desc: "High-quality interior and exterior painting services to refresh your living space.", icon: PaintRoller },
  { id: "cleaning", name: "Cleaning", desc: "Thorough deep cleaning services for homes and offices, leaving spaces spotless.", icon: Sparkles },
  { id: "appliance", name: "Appliance Repair", desc: "Reliable repair services for fridges, washing machines, ovens, and other home appliances.", icon: Tv },
  { id: "maintenance", name: "Home Maintenance", desc: "General handyman services and routine maintenance to keep your home in top shape.", icon: Home },
];

export default function Services() {
  return (
    <>
      <Helmet>
        <title>All Services | Athoo</title>
        <meta name="description" content="Explore Athoo's full range of home services in Pakistan including electricians, plumbers, AC repair, and cleaning services." />
      </Helmet>
      
      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From quick fixes to major repairs, Athoo connects you with verified professionals for all your home service needs in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <div key={service.id} id={service.id} className="bg-card border rounded-2xl p-8 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-4 right-4 bg-muted text-xs font-semibold px-2 py-1 rounded-md text-muted-foreground opacity-70">
                  Coming Soon
                </div>
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{service.name}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-24 pt-12 border-t text-center text-sm text-muted-foreground">
             <p>Athoo is building the premier local service marketplace. Looking for an electrician in Pakistan, a plumber in Pakistan, or AC repair in Pakistan? Our platform ensures quality home services in Pakistan.</p>
          </div>
        </div>
      </div>
    </>
  );
}