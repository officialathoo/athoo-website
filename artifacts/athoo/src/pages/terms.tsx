import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Athoo</title>
      </Helmet>
      
      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-lg prose-blue max-w-none text-gray-600">
            <p className="font-semibold text-gray-900">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using the Athoo platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using the platform.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Description of Service</h2>
            <p>
              Athoo operates as a marketplace platform that connects customers seeking home services with independent service professionals. Athoo itself does not provide these services directly and is not an employer of the service professionals.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. User Obligations</h2>
            <p>As a user of the platform, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and account.</li>
              <li>Provide a safe and hazard-free environment for service professionals executing jobs at your premises.</li>
              <li>Pay for all services requested and completed through the platform.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Provider Terms</h2>
            <p>
              Independent professionals using the platform agree to maintain the required skills, maintain professional conduct, and complete accepted jobs to the best of their ability. Providers must comply with all local laws and regulations in Pakistan.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Athoo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, resulting from your use of the platform or the services provided by independent professionals.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Contact Information</h2>
            <p>
              Questions about the Terms should be sent to us at official.athoo@gmail.com.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}