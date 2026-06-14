import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — Athoo</title>
        <meta name="description" content="Athoo's Terms & Conditions — the rules governing use of the Athoo platform for customers and service providers." />
        <link rel="canonical" href="https://athoo.pk/terms" />
      </Helmet>

      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: June 2026</p>

          <div className="prose prose-lg prose-blue max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-blue-600">

            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the Athoo website at <a href="https://athoo.pk">athoo.pk</a> or any future Athoo mobile application (the "Platform"), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, you may not use the Platform.
            </p>

            <h2>2. About Athoo</h2>
            <p>
              Athoo is a marketplace and technology platform that connects customers seeking home services with independent service professionals ("Providers"). Athoo does not directly provide any home services. Athoo is not the employer of service providers listed on the Platform. Providers are independent professionals who offer their services directly to customers.
            </p>
            <p>
              Athoo is currently in pre-launch phase. The mobile application is not yet publicly available. These terms govern use of the website and all pre-launch features including waitlist registration and provider interest forms.
            </p>

            <h2>3. Customer Terms</h2>

            <h3>3.1 Eligibility</h3>
            <p>
              You must be at least 18 years of age to use the Athoo Platform as a customer. By registering, you confirm that you meet this requirement.
            </p>

            <h3>3.2 Customer Responsibilities</h3>
            <ul>
              <li>Provide accurate and complete information when registering or submitting requests</li>
              <li>Treat service providers with respect and professionalism</li>
              <li>Be present or make reasonable arrangements for the provider to access the property</li>
              <li>Confirm the scope of work and pricing with the provider before work begins</li>
              <li>Pay the agreed amount upon completion of satisfactory work</li>
              <li>Report any concerns or issues through the appropriate support channels</li>
            </ul>

            <h3>3.3 Service Expectations</h3>
            <p>
              Athoo aims to provide access to verified professionals, but cannot guarantee the outcome of any specific service. Customers are encouraged to clearly describe their needs and confirm all details — including materials and pricing — before work begins.
            </p>

            <h2>4. Provider Terms</h2>

            <h3>4.1 Provider Status</h3>
            <p>
              Service providers on Athoo are independent professionals. Listing on Athoo does not create an employment relationship, agency relationship, or partnership with Athoo. Providers are solely responsible for the quality, safety, and completion of their work.
            </p>

            <h3>4.2 Provider Responsibilities</h3>
            <ul>
              <li>Provide truthful information during registration and verification</li>
              <li>Maintain the professional standards expected of their trade</li>
              <li>Communicate clearly with customers before, during, and after a job</li>
              <li>Provide accurate quotes and discuss all costs — including materials — before starting work</li>
              <li>Complete agreed work within the agreed timeframe</li>
              <li>Treat customers and their property with respect</li>
              <li>Carry appropriate tools and materials for the job</li>
            </ul>

            <h3>4.3 Provider Verification</h3>
            <p>
              Athoo conducts a verification process for providers before they are listed on the Platform. Verification does not constitute endorsement of any specific level of professional qualification. Athoo reserves the right to remove any provider from the Platform at its discretion.
            </p>

            <h2>5. Pricing and Payments</h2>
            <p>
              Pricing on the Athoo Platform is set by service providers and agreed upon by customers before work begins. Athoo does not set or guarantee any specific price for any service.
            </p>
            <p>
              <strong>Materials and spare parts:</strong> The cost of materials and spare parts required for a job is not included in the base service fee unless explicitly stated by the provider. Providers must discuss and agree on all material costs with the customer before beginning work. Customers should not be charged for materials without prior agreement.
            </p>
            <p>
              Athoo's platform fee structure and payment methods will be communicated before the full platform launch.
            </p>

            <h2>6. Cancellations and Disputes</h2>
            <p>
              Cancellation policies and dispute resolution procedures will be published before the Platform's full launch. During pre-launch, any concerns should be raised with Athoo support at <a href="mailto:support@athoo.pk">support@athoo.pk</a>.
            </p>
            <p>
              Athoo may act as a facilitator in disputes between customers and providers but is not obligated to resolve disputes or guarantee any specific outcome.
            </p>

            <h2>7. Safety</h2>
            <p>
              Safety is a priority for Athoo. We ask all users to:
            </p>
            <ul>
              <li>Not provide false information that could affect safety</li>
              <li>Report any safety concerns immediately to Athoo support</li>
              <li>Ensure a responsible adult is present during service visits where appropriate</li>
              <li>Not engage in any unlawful, dangerous, or abusive behaviour on or through the Platform</li>
            </ul>
            <p>
              Athoo is not liable for any personal injury, property damage, or loss that occurs as a result of a service arranged through the Platform. Users engage with service providers at their own risk and are encouraged to take appropriate precautions.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              All content on the Athoo website — including the Athoo name, logo, text, graphics, and design — is the intellectual property of Athoo. You may not reproduce, distribute, or use any of this content without written permission from Athoo.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Athoo shall not be liable for:
            </p>
            <ul>
              <li>The quality, safety, or completion of any service provided by a Platform provider</li>
              <li>Any direct, indirect, incidental, or consequential damages arising from use of the Platform</li>
              <li>Loss of data, revenue, or business resulting from Platform downtime or technical issues</li>
              <li>Any dispute between customers and service providers</li>
            </ul>

            <h2>10. Platform Availability</h2>
            <p>
              Athoo does not guarantee uninterrupted access to the Platform. We reserve the right to suspend, modify, or discontinue any feature of the Platform at any time with or without notice.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We may update these Terms & Conditions from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised terms. We will update the date at the top of this page when changes are made.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of Pakistan. Any disputes arising from these terms shall be subject to the jurisdiction of the courts of Pakistan.
            </p>

            <h2>13. Contact</h2>
            <p>
              For questions about these Terms & Conditions:
            </p>
            <ul>
              <li>Email: <a href="mailto:official@athoo.pk">official@athoo.pk</a></li>
              <li>Website: <a href="https://athoo.pk">athoo.pk</a></li>
            </ul>

          </div>

          <div className="mt-16 flex flex-wrap gap-4 border-t border-gray-100 pt-8">
            <Link href="/privacy" className="text-sm text-[#0057FF] hover:underline">Privacy Policy</Link>
            <Link href="/cookie-policy" className="text-sm text-[#0057FF] hover:underline">Cookie Policy</Link>
            <Link href="/contact" className="text-sm text-[#0057FF] hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
