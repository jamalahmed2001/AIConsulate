import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/ui/CTA";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <span className="inline-block h-6 w-6 rounded bg-brand-600" aria-hidden />
              AI Consulate Advisory
            </div>
            <p className="text-sm text-neutral-600">
              Ship AI that works: strategy, automation, and agentic systems with evidence before scale.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Company</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-brand-700">About</Link></li>
                <li><Link href="/services" className="hover:text-brand-700">Services</Link></li>
                <li><Link href="/case-studies" className="hover:text-brand-700">Case Studies</Link></li>
                <li><Link href="/pricing" className="hover:text-brand-700">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Legal</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-brand-700">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-700">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex items-center md:justify-end">
            <CTA href="/contact" size="lg" label="Start the conversation" />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-neutral-600 md:flex-row">
          <p>© {new Date().getFullYear()} AI Consulate Advisory. All rights reserved.</p>
          <div className="text-xs">
            Built with reliability in mind.
          </div>
        </div>
      </Container>
    </footer>
  );
}
