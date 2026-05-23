import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Athoo</title>
      </Helmet>
      
      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg prose-blue max-w-none text-gray-600">
            <p className="font-semibold text-gray-900">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Introduction</h2>
            <p>
              At Athoo ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile application (the "Platform"). Please read this policy carefully.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, delivery address, email address, and telephone number, that you voluntarily give to us when you register.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Platform, such as your IP address, browser type, operating system, and access times.</li>
              <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase services.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. How We Use Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account.</li>
              <li>Process your requests and connect you with service providers.</li>
              <li>Email you regarding your account or bookings.</li>
              <li>Increase the efficiency and operation of the Platform.</li>
              <li>Monitor and analyze usage and trends to improve your experience.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed to our verified service providers so they can fulfill the services you request. We do not sell your personal information to third parties.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
              <br />
              Email: <strong>official.athoo@gmail.com</strong>
              <br />
              Phone: <strong>+92 339 0051068</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}