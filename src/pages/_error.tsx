import type { NextPageContext } from "next";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-2 text-4xl font-bold">{statusCode ?? 500}</h1>
      <p className="text-neutral-700">An unexpected error occurred.</p>
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
  return { statusCode } as { statusCode?: number };
};

export default Error;
