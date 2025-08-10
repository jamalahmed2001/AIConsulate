import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { PageHeader } from "@/components/ui/PageHeader";

export default function TermsPage() {
  return (
    <>
      <NextSeo
        title="Terms of Service — AI Consulate Advisory"
        description="Terms of service for AI Consulate Advisory consulting services."
        openGraph={{
          title: "Terms of Service — AI Consulate Advisory",
          description: "Terms of service for AI Consulate Advisory consulting services.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="Terms of Service"
          subtitle="Legal terms governing the use of our services."
          crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
        />
        <Section tone="surface">
          <Prose>
            <p>
              These terms govern your use of our website and services. By
              accessing the site, you agree to these terms.
            </p>
            
            <h3>Use of Services</h3>
            <p>
              You may use our services for lawful business purposes only. Do not misuse the services. 
              We may suspend or stop services if you do not comply with these terms.
            </p>
            
            <h3>Consulting Services</h3>
            <p>
              Our consulting services are provided under separate statements of work that detail
              specific scope, deliverables, and terms. These terms apply to all engagements unless
              superseded by written agreement.
            </p>
            
            <h3>Intellectual Property</h3>
            <p>
              Work product created during consulting engagements transfers to the client upon
              completion and payment. We retain no rights to client code, data, or intellectual property.
            </p>
            
            <h3>Confidentiality</h3>
            <p>
              We maintain strict confidentiality of all client information and data. Standard NDAs
              are signed before any engagement begins.
            </p>
            
            <h3>Limitation of Liability</h3>
            <p>
              To the extent permitted by law, we are not liable for indirect, incidental, or
              consequential damages. Our liability is limited to the fees paid for services.
            </p>
            
            <h3>Changes to Terms</h3>
            <p>
              We may update these terms from time to time. Continued use of our services constitutes
              acceptance of updated terms.
            </p>
            
            <h3>Contact</h3>
            <p>
              Questions about these terms? Contact us through our contact form or email directly.
            </p>
          </Prose>
        </Section>
      </main>
    </>
  );
}
