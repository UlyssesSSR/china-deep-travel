import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1A1A2E] mb-8">Privacy Policy</h1>
        <p className="text-[#6B7280] mb-8">Last updated: August 28, 2026</p>

        <div className="bg-white rounded-xl border border-[#E8E4DF] p-8 space-y-8 text-[#1A1A2E] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              China Deep Travel ("we," "us," or "our") collects information you provide directly to us,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, and password when you register.</li>
              <li><strong>Payment Information:</strong> Credit card details processed securely by Stripe or PayPal.
                We do not store your full credit card number.</li>
              <li><strong>Usage Data:</strong> Articles you unlock, points you purchase, and your reading history.</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send you related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Third parties who perform services on our behalf
                (payment processing, email delivery, hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track activity on our website and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>
            <p>
              We use the following types of cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function (authentication, session management)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Marketing Cookies:</strong> Used to track visitors across websites for advertising purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal
              information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (HTTPS) and at rest</li>
              <li>Secure password hashing using bcrypt</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication for internal systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights (GDPR)</h2>
            <p className="mb-4">If you are located in the European Economic Area (EEA), you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw your consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@chinadeeptravel.com" className="text-[#C0392B] hover:underline">
                privacy@chinadeeptravel.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed
              to provide you services. We will delete or anonymize your data upon request, except
              where we are required to retain it by law (e.g., financial records for tax purposes).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian
              and believe your child has provided us with personal information, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place, such as standard contractual clauses
              approved by the European Commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none space-y-2">
              <li>Email: <a href="mailto:privacy@chinadeeptravel.com" className="text-[#C0392B] hover:underline">privacy@chinadeeptravel.com</a></li>
              <li>Address: [Your Business Address]</li>
              <li>Website: <Link href="/contact" className="text-[#C0392B] hover:underline">Contact Form</Link></li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[#C0392B] hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
