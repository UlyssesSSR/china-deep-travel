import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1A1A2E] mb-8">Terms of Service</h1>
        <p className="text-[#6B7280] mb-8">Last updated: August 28, 2026</p>

        <div className="bg-white rounded-xl border border-[#E8E4DF] p-8 space-y-8 text-[#1A1A2E] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing or using China Deep Travel ("the Service"), you agree to be bound by these
              Terms of Service ("Terms"). If you disagree with any part of these terms, you may not
              access the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              China Deep Travel provides premium travel guides and content about China. Users can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browse free articles and travel information</li>
              <li>Purchase CPT Points to unlock premium content</li>
              <li>Access detailed guides, itineraries, and local insights</li>
              <li>Save and bookmark articles for future reference</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you must provide accurate, complete, and current
              information. Failure to do so constitutes a breach of the Terms, which may result in
              immediate termination of your account.
            </p>
            <p className="mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Safeguarding the password that you use to access the Service</li>
              <li>Any activities or actions under your account</li>
              <li>Notifying us immediately upon becoming aware of any breach of security or unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. CPT Points System</h2>
            <p className="mb-4">
              CPT Points are virtual credits that can be purchased and used to unlock premium content.
            </p>
            <div className="bg-[#FAFAF8] p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Points Usage Rules:</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>1 USD = 30 CPT Points (base rate)</li>
                <li>Points are non-transferable and cannot be exchanged for cash</li>
                <li>Points never expire — they stay in your account until you spend them</li>
                <li>Each article requires a specific number of points to unlock (default: 15 points)</li>
                <li>Once unlocked, articles remain accessible indefinitely</li>
              </ul>
            </div>
            <p>
              We may update the points program from time to time (for example, exchange rates or new
              features). If a change affects your existing points, we will email registered users at
              least 30 days in advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Purchases and Payment</h2>
            <p className="mb-4">
              You may purchase CPT Points through Stripe or PayPal. By making a purchase:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You represent that you are authorized to use the payment method</li>
              <li>You authorize us to charge your chosen payment method for the selected amount</li>
              <li>All payments are processed securely by third-party payment processors</li>
              <li>We do not store your complete payment card information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Refund Policy</h2>
            <p className="mb-4">
              Due to the digital nature of our service, all purchases are final and non-refundable
              except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Duplicate charges for the same transaction</li>
              <li>Technical errors on our end resulting in points not being credited</li>
              <li>Content that is significantly different from its description</li>
            </ul>
            <p className="mt-4">
              If you have a special concern about a recent purchase (for example, a duplicate charge
              or technical error), contact us at{' '}
              <a href="mailto:support@chinadeeptravel.com" className="text-[#C0392B] hover:underline">
                support@chinadeeptravel.com
              </a>{' '}
              and we will review your case individually.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content, features, and functionality are owned by China
              Deep Travel and are protected by international copyright, trademark, patent, trade
              secret, and other intellectual property laws.
            </p>
            <p className="mb-4">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reproduce, distribute, or create derivative works from our content</li>
              <li>Use our content for commercial purposes without permission</li>
              <li>Remove any copyright or proprietary notices</li>
              <li>Share unlocked content with non-paying users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. User Conduct</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Share your account credentials with others</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability,
              for any reason, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Breach of these Terms</li>
              <li>Conduct that we believe is harmful to other users or the Service</li>
              <li>Legal requirements or requests from law enforcement</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the Service will immediately cease. Provisions
              that by their nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall China Deep Travel, its directors, employees, partners, agents,
              suppliers, or affiliates be liable for any indirect, incidental, special, consequential,
              or punitive damages, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Loss of profits, data, or other intangible losses</li>
              <li>Damages resulting from your use or inability to use the Service</li>
              <li>Unauthorized access to or alteration of your transmissions or data</li>
              <li>Statements or conduct of any third party on the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimer</h2>
            <p className="mb-4">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties,
              expressed or implied, and hereby disclaim all other warranties including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Merchantability, fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or reliability of content</li>
              <li>That the Service will be uninterrupted or error-free</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the
              jurisdiction in which China Deep Travel operates, without regard to its conflict
              of law provisions. Any disputes arising from these Terms shall be resolved through
              arbitration or in the courts of the applicable jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is
              material, we will try to provide at least 30 days' notice prior to any new terms
              taking effect.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective,
              you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable by a court,
              the remaining provisions will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
            <p className="mb-4">If you have any questions about these Terms, please contact us:</p>
            <ul className="list-none space-y-2">
              <li>Email: <a href="mailto:legal@chinadeeptravel.com" className="text-[#C0392B] hover:underline">legal@chinadeeptravel.com</a></li>
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
