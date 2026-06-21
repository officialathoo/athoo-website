import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function CookiePolicy() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy — Athoo</title>
        <meta name="description" content="Learn how Athoo uses cookies and similar technologies on its website." />
        <link rel="canonical" href="https://www.athoo.pk/cookie-policy" />
        <meta property="og:title" content="Cookie Policy — Athoo" />
        <meta property="og:description" content="Learn how Athoo uses cookies and similar technologies on its website." />
        <meta property="og:url" content="https://www.athoo.pk/cookie-policy" />
        <meta property="og:image" content="https://www.athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Cookie Policy — Athoo" />
        <meta name="twitter:description" content="How Athoo uses cookies and similar technologies on its website." />
      </Helmet>

      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: June 2026</p>

          <div className="prose prose-lg prose-blue max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold">

            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the website owner.
            </p>
            <p>
              Similar technologies include web beacons, pixel tags, and local storage — we use the term "cookies" in this policy to refer to all of these technologies.
            </p>

            <h2>2. How Athoo Uses Cookies</h2>
            <p>The Athoo website uses cookies for the following purposes:</p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function correctly. They enable core functionality such as page navigation, form submissions, and access to secure areas of the website. The website cannot function properly without these cookies. They do not collect personally identifiable information.
            </p>

            <h3>Functional Cookies</h3>
            <p>
              These cookies allow the website to remember choices you make (such as your preferred language or your location) and provide enhanced, more personalised features. For example, we may store basic website preferences locally so they remain consistent across visits.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              We may use analytics services to help us understand how visitors use our website — which pages are visited most, where visitors come from, and how they interact with the site. This helps us improve the website experience. Any analytics data collected is aggregated and does not identify individual visitors.
            </p>

            <h2>3. Cookies We Do Not Use</h2>
            <p>
              Athoo does not currently use advertising cookies, behavioural tracking cookies, or third-party marketing cookies. We do not sell, trade, or share user data with advertising networks.
            </p>

            <h2>4. Third-Party Cookies</h2>
            <p>
              Some pages on the Athoo website may include embedded content from third-party services (such as social media share buttons or embedded maps). These third parties may set their own cookies. Athoo does not control third-party cookies. Please refer to the respective third parties' privacy and cookie policies for more information.
            </p>

            <h2>5. Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul>
              <li>View the cookies stored on your device</li>
              <li>Delete all or specific cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p>
              Please note that restricting cookies may impact the functionality of the Athoo website. Essential cookies cannot be disabled without affecting website performance.
            </p>
            <p>
              To manage cookies in your browser, refer to your browser's help documentation. Common browsers include:
            </p>
            <ul>
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Safari</li>
              <li>Microsoft Edge</li>
            </ul>

            <h2>6. Local Storage</h2>
            <p>
              In addition to cookies, the Athoo website uses browser local storage to save certain user preferences on your device. This data is stored only on your device and is not transmitted to our servers.
            </p>

            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be reflected on this page with an updated date. We encourage you to review this policy periodically.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about how Athoo uses cookies, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:official@athoo.pk">official@athoo.pk</a></li>
              <li>Website: <a href="https://www.athoo.pk">athoo.pk</a></li>
            </ul>

          </div>

          <div className="mt-16 flex flex-wrap gap-4">
            <Link href="/privacy" className="text-sm text-[#0057FF] hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-[#0057FF] hover:underline">Terms & Conditions</Link>
            <Link href="/contact" className="text-sm text-[#0057FF] hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
