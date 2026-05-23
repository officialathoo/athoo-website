import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Athoo</title>
        <meta name="description" content="Learn about Athoo's mission to transform the home services industry in Pakistan." />
      </Helmet>
      <div className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Building Trust in Home Services</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are on a mission to connect millions of Pakistanis with reliable, verified service professionals.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">The Problem We're Solving</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Finding a reliable electrician, plumber, or AC technician in Pakistan has traditionally been a hassle. It relies on word-of-mouth, unverified contacts, and unpredictable pricing. We recognized the need for a modern, tech-driven solution that brings transparency, safety, and efficiency to the local services market.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
              <div className="bg-primary/5 p-8 rounded-2xl border">
                <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To empower local professionals by providing them with a digital platform to grow their business, while offering customers a safe, seamless, and reliable way to book home services.
                </p>
              </div>
              <div className="bg-orange-500/5 p-8 rounded-2xl border border-orange-500/20">
                <h3 className="text-2xl font-bold text-orange-600 mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become Pakistan's most trusted everyday app for all household needs, setting new standards for service quality and customer satisfaction across the country.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6">Why Pakistan Needs Athoo</h2>
            <ul className="space-y-4 text-muted-foreground mb-12">
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">•</span>
                <span><strong>Reliability:</strong> No more waiting hours for someone who might not show up.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">•</span>
                <span><strong>Safety:</strong> Every professional on our platform is verified and tracked.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-primary">•</span>
                <span><strong>Fair Pricing:</strong> Transparent rates so you know what you're paying for.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}