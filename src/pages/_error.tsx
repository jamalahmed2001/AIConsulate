import type { NextPageContext } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <main className="min-h-screen">
      <PageHeader
        title={`Error ${statusCode ?? 500}`}
        subtitle="An unexpected error occurred."
        crumbs={[{ label: "Home", href: "/" }, { label: "Error" }]}
      />
    </main>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode =
    res?.statusCode ??
    (typeof (err as unknown as { statusCode?: number } | undefined)
      ?.statusCode === "number"
      ? (err as unknown as { statusCode?: number }).statusCode
      : 404);
  return { statusCode };
};

export default Error;
