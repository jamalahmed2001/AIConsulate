import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-neutral-600 md:flex-row">
        <p>
          © {new Date().getFullYear()} AI Consulate Advisory. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-black">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-black">
            Terms
          </Link>
        </div>
      </Container>
    </footer>
  );
}
