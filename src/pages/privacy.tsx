import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PrivacyPage() {
  return (
    <>
      <NextSeo
        title="Privacy Policy — AI Consulate Advisory"
        description="Privacy policy for AI Consulate Advisory. We respect your privacy and protect your data."
        openGraph={{
          title: "Privacy Policy — AI Consulate Advisory",
          description: "Privacy policy for AI Consulate Advisory. We respect your privacy and protect your data.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="Privacy Policy"
          subtitle="How we collect, use, and protect your information."
          crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        />
        <Section tone="surface">
          <Prose>
            <p>
              We respect your privacy and are committed to protecting your personal data. 
              We only collect information necessary to respond to your inquiries and deliver services. 
              We do not sell your data to third parties.
            </p>
            
            <h3>Information We Collect</h3>
            <ul>
              <li><strong>Contact Information:</strong> Name, email, company, and message when you submit our contact form</li>
              <li><strong>Usage Analytics:</strong> Basic website analytics to understand how our site is used (no personal cookies)</li>
              <li><strong>Project Data:</strong> Information shared during consulting engagements, handled under strict confidentiality</li>
            </ul>
            
            <h3>How We Use Your Information</h3>
            <p>
              We use collected information to:
            </p>
            <ul>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Deliver consulting services as agreed</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
            
            <h3>Data Security</h3>
            <p>
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul>
              <li>Encrypted data transmission and storage</li>
              <li>Access controls and authentication</li>
              <li>Regular security assessments</li>
              <li>Staff training on data protection</li>
            </ul>
            
            <h3>Data Retention</h3>
            <p>
              We retain personal data only as long as necessary for the purposes collected:
            </p>
            <ul>
              <li><strong>Contact forms:</strong> 2 years or until you request deletion</li>
              <li><strong>Project data:</strong> As specified in consulting agreements</li>
              <li><strong>Analytics:</strong> Aggregated and anonymized data only</li>
            </ul>
            
            <h3>Your Rights</h3>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
            </ul>
            
            <h3>Third-Party Services</h3>
            <p>
              We may use third-party services for analytics and email delivery. 
              These services are selected for their privacy practices and data protection standards.
            </p>
            
            <h3>Changes to This Policy</h3>
            <p>
              We may update this privacy policy to reflect changes in our practices or legal requirements. 
              We will notify you of significant changes.
            </p>
            
            <h3>Contact Us</h3>
            <p>
              For privacy questions or to exercise your rights, contact us through our contact form 
              or email us directly. We will respond within 30 days.
            </p>
          </Prose>
        </Section>
      </main>
    </>
  );
}
