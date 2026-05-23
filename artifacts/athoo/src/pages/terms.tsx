import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Athoo</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        <div className="prose dark:prose-invert">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Athoo, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our services.</p>
          
          <h2>2. Description of Service</h2>
          <p>Athoo provides a platform connecting customers with independent, local home service professionals in Pakistan. We facilitate the booking process but do not directly employ the service providers.</p>
          
          <h2>3. User Responsibilities</h2>
          <ul>
            <li>You must provide accurate and complete information when registering or booking a service.</li>
            <li>You agree to use the platform for lawful purposes only.</li>
            <li>Customers are responsible for providing a safe working environment for service providers.</li>
          </ul>

          <h2>4. Payments and Fees</h2>
          <p>Pricing for services is outlined prior to booking. You agree to pay the stated fees for the services rendered. Any additional work requested on-site may incur extra charges agreed upon between the customer and provider.</p>

          <h2>5. Limitation of Liability</h2>
          <p>Athoo acts as an intermediary. While we verify our professionals, we are not liable for any direct, indirect, incidental, or consequential damages resulting from the services provided.</p>

          <h2>6. Contact</h2>
          <p>For any inquiries regarding these terms, contact us at official.athoo@gmail.com.</p>
        </div>
      </div>
    </>
  );
}