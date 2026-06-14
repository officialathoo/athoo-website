import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Athoo</title>
        <meta name="description" content="Athoo's Privacy Policy — how we collect, use, and protect your personal data as a customer or service provider on the Athoo platform." />
        <link rel="canonical" href="https://athoo.pk/privacy" />
      </Helmet>

      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: June 2026</p>

          <div className="prose prose-lg prose-blue max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-blue-600">

            <h2>1. Introduction</h2>
            <p>
              At Athoo ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use the Athoo website at <a href="https://athoo.pk">athoo.pk</a> or any future Athoo mobile application (the "Platform").
            </p>
            <p>
              By using the Platform, you consent to the data practices described in this policy. If you do not agree with the terms of this policy, please do not use the Platform.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Customer Data</h3>
            <p>When you join the customer waitlist or submit a contact form, we collect:</p>
            <ul>
              <li>Name and email address</li>
              <li>Phone number (where provided)</li>
              <li>Message content and inquiry details</li>
              <li>Service preferences or area information where voluntarily provided</li>
            </ul>

            <h3>2.2 Provider Data</h3>
            <p>When you register as a service provider, we collect:</p>
            <ul>
              <li>Full name and contact details</li>
              <li>Service category and trade experience</li>
              <li>City and service area</li>
              <li>Identity and verification documents (during onboarding)</li>
              <li>Professional profile information</li>
            </ul>

            <h3>2.3 Location Data</h3>
            <p>
              When the app is live, we may collect location data with your permission for service matching and job routing. You can control location permissions through your device settings.
            </p>

            <h3>2.4 Contact Form and Support Request Data</h3>
            <p>
              Any information you submit through our contact, support, or waitlist forms is collected and stored to respond to your request and manage our platform operations.
            </p>

            <h3>2.5 Technical and Usage Data</h3>
            <p>
              We automatically collect certain technical information when you visit our website — including your IP address, browser type, operating system, pages visited, and access times. This data helps us improve the Platform and diagnose issues.
            </p>

            <h3>2.6 Communications</h3>
            <p>
              If you contact us by email or WhatsApp, we retain records of that communication to respond to your inquiry and improve our support processes.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Respond to your inquiries and support requests</li>
              <li>Notify you about Athoo's launch, updates, and relevant news</li>
              <li>Manage provider registration and onboarding</li>
              <li>Match customers with service providers (after launch)</li>
              <li>Improve and operate the Platform</li>
              <li>Ensure platform security and prevent fraudulent activity</li>
              <li>Comply with applicable laws and regulations</li>
            </ul>
            <p>
              We do not sell, trade, or rent your personal information to third parties for their marketing purposes.
            </p>

            <h2>4. Sharing of Information</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service providers:</strong> Third-party companies that assist us in operating the Platform, such as email delivery services, analytics tools, and cloud hosting. These parties are contractually bound to protect your data.</li>
              <li><strong>Law enforcement:</strong> Where required by law, court order, or government regulation.</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, personal data may be transferred as part of that transaction.</li>
            </ul>
            <p>
              When the platform is live: limited provider profile information (name, service category, area) may be visible to customers for service matching. Customer personal details are not shared with providers beyond what is necessary for job completion.
            </p>

            <h2>5. Uploaded Documents and Media</h2>
            <p>
              Documents submitted during provider verification (such as identity documents) are stored securely and used only for verification purposes. They are not made publicly visible on the Platform and are accessible only to authorised Athoo personnel.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These measures include secure server infrastructure, access controls, and encrypted data transmission (HTTPS).
            </p>
            <p>
              However, no method of internet transmission or electronic storage is 100% secure. While we strive to protect your personal data, we cannot guarantee its absolute security.
            </p>

            <h2>7. Third-Party Tools and Services</h2>
            <p>
              The Platform may use third-party tools such as analytics services and email delivery platforms. These services have their own privacy policies governing the use of data shared with them. We recommend reviewing those policies for services you interact with through our Platform.
            </p>

            <h2>8. Cookies and Local Storage</h2>
            <p>
              We use cookies and browser local storage to improve your experience on the Platform. For details, see our <Link href="/cookie-policy">Cookie Policy</Link>.
            </p>

            <h2>9. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to certain data processing activities</li>
              <li>Request data portability</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <a href="mailto:official@athoo.pk">official@athoo.pk</a>. We will respond within a reasonable time frame.
            </p>

            <h2>10. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfil the purposes described in this policy, or as required by applicable law. Waitlist data will be retained until the platform launches and user accounts are migrated, or until you request deletion.
            </p>

            <h2>11. Children's Privacy</h2>
            <p>
              The Athoo Platform is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such data, please contact us and we will delete it promptly.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page. Continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:official@athoo.pk">official@athoo.pk</a></li>
              <li>Support: <a href="mailto:support@athoo.pk">support@athoo.pk</a></li>
              <li>Website: <a href="https://athoo.pk">athoo.pk</a></li>
            </ul>

          </div>

          <div className="mt-16 flex flex-wrap gap-4 border-t border-gray-100 pt-8">
            <Link href="/terms" className="text-sm text-[#0057FF] hover:underline">Terms & Conditions</Link>
            <Link href="/cookie-policy" className="text-sm text-[#0057FF] hover:underline">Cookie Policy</Link>
            <Link href="/contact" className="text-sm text-[#0057FF] hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
