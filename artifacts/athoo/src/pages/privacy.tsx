import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Athoo</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>At Athoo, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
          
          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, and physical address.</li>
            <li><strong>Service Data:</strong> Details about the services you request or provide.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with our website and app.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected data to:</p>
          <ul>
            <li>Provide and maintain our services.</li>
            <li>Connect customers with verified professionals.</li>
            <li>Improve, personalize, and expand our platform.</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service and updates.</li>
          </ul>

          <h2>4. Data Sharing and Security</h2>
          <p>We do not sell your personal information. We may share necessary details with service providers solely to facilitate your bookings. We implement industry-standard security measures to protect your data.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at official.athoo@gmail.com.</p>
        </div>
      </div>
    </>
  );
}