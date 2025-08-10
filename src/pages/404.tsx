import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <PageHeader
        title="Page not found"
        subtitle="The page you are looking for does not exist."
        crumbs={[{ label: "Home", href: "/" }, { label: "404" }]}
      />
      <div className="flex items-center justify-center p-8 text-center">
        <CTA href="/" size="md">Go home</CTA>
      </div>
    </main>
  );
}
